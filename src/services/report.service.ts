import { prisma } from "@/lib/prisma";

export type RangeKey = "today" | "week" | "month" | "custom";

export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProduct: string;
  topProductUnits: number;
  rangeLabel: string;
  start: Date;
  end: Date;
}

export function resolveDateRange(range: RangeKey, from?: string, to?: string) {
  const now = new Date();

  if (range === "custom" && from && to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    return { start: new Date(from), end, label: `${from} - ${to}` };
  }

  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start, end: now, label: "Today" };
  }

  if (range === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return { start, end: now, label: "This Week" };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end: now, label: "This Month" };
}

// Computes revenue, order counts, and top product for a date range.
// Cancelled orders count toward "Total Orders" (still real activity)
// but are excluded from revenue and average order value.
export async function getReportSummary(
  range: RangeKey,
  from?: string,
  to?: string
): Promise<ReportSummary> {
  const { start, end, label } = resolveDateRange(range, from, to);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: true },
  });

  const revenueOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const averageOrderValue =
    revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;

  const productUnits = new Map<string, number>();
  for (const order of revenueOrders) {
    for (const item of order.items) {
      productUnits.set(item.productName, (productUnits.get(item.productName) ?? 0) + item.quantity);
    }
  }

  let topProduct = "—";
  let topProductUnits = 0;
  for (const [name, units] of productUnits) {
    if (units > topProductUnits) {
      topProduct = name;
      topProductUnits = units;
    }
  }

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    topProduct,
    topProductUnits,
    rangeLabel: label,
    start,
    end,
  };
}