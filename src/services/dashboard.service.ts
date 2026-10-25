import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

// ---- Dashboard money rules — change them here only --------------------
// Not confirmed yet: NOT counted in Total Sales.
export const PENDING_STATUSES: OrderStatus[] = ["pending"];

// Confirmed by the admin (processing -> delivered): counted in Total Sales.
export const CONFIRMED_STATUSES: OrderStatus[] = [
  "processing",
  "packing",
  "out_for_delivery",
  "delivered",
  // Older statuses from before the new stages, so old orders still count.
  "confirmed",
  "shipped",
];

// Cancelled: never counted in Total Sales.
export const CANCELLED_STATUSES: OrderStatus[] = ["cancelled"];

export interface StatusBucket {
  count: number;
  amount: number; // sum of order totals
  deliveryCharges: number; // sum of delivery charges
}

export interface DashboardStats {
  pending: StatusBucket;
  confirmed: StatusBucket; // confirmed + delivered
  cancelled: StatusBucket;
  totalOrders: number; // every order, any status
  totalSales: number; // confirmed/delivered orders only
  totalDeliveryCharges: number; // delivery charges across ALL orders
  deliveredDeliveryCharges: number; // part of the above for delivered orders
}

const emptyBucket = (): StatusBucket => ({ count: 0, amount: 0, deliveryCharges: 0 });

// One grouped query instead of loading every order. Because everything is
// derived from each order's CURRENT status, moving an order between
// statuses (or cancelling it) updates every figure automatically.
export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
    _sum: { total: true, deliveryCharge: true },
  });

  const pending = emptyBucket();
  const confirmed = emptyBucket();
  const cancelled = emptyBucket();
  let deliveredDeliveryCharges = 0;

  for (const row of rows) {
    const bucket = PENDING_STATUSES.includes(row.status)
      ? pending
      : CONFIRMED_STATUSES.includes(row.status)
        ? confirmed
        : CANCELLED_STATUSES.includes(row.status)
          ? cancelled
          : null;

    if (!bucket) continue;

    const deliveryCharges = Number(row._sum.deliveryCharge ?? 0);

    bucket.count += row._count._all;
    bucket.amount += Number(row._sum.total ?? 0);
    bucket.deliveryCharges += deliveryCharges;

    if (row.status === "delivered") {
      deliveredDeliveryCharges += deliveryCharges;
    }
  }

  return {
    pending,
    confirmed,
    cancelled,
    totalOrders: pending.count + confirmed.count + cancelled.count,
    totalSales: confirmed.amount,
    totalDeliveryCharges:
      pending.deliveryCharges + confirmed.deliveryCharges + cancelled.deliveryCharges,
    deliveredDeliveryCharges,
  };
}

// Daily sales for the chart — confirmed/delivered orders only, grouped by
// the day the order was placed, with PKR 0 filled in for empty days.
export async function getDailySales(days: number) {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: { in: CONFIRMED_STATUSES }, createdAt: { gte: start } },
    select: { createdAt: true, total: true },
  });

  const totals = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    totals.set(day.toDateString(), 0);
  }

  for (const order of orders) {
    const key = order.createdAt.toDateString();
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + Number(order.total));
    }
  }

  return Array.from(totals.entries()).map(([dateStr, total]) => ({
    label: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total,
  }));
}