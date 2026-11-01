import Link from "next/link";
import AutoRefresh from "@/components/admin/AutoRefresh";
import { prisma } from "@/lib/prisma";
import { PENDING_STATUSES, CONFIRMED_STATUSES } from "@/services/dashboard.service";

// Same status groups the dashboard money cards use, so the board and the
// numbers always agree: everything confirmed except Delivered is
// "in processing".
const PROCESSING_STATUSES = CONFIRMED_STATUSES.filter((status) => status !== "delivered");
const DELIVERED_LIMIT = 7;

const STAGE_LABELS: Record<string, string> = {
  processing: "Processing",
  packing: "Packing",
  out_for_delivery: "Out for Delivery",
  confirmed: "Confirmed",
  shipped: "Shipped",
};

const STAGE_STYLES: Record<string, string> = {
  processing: "bg-blue-100 text-blue-700",
  packing: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
};

const orderSelect = {
  id: true,
  orderNumber: true,
  name: true,
  total: true,
  status: true,
  createdAt: true,
} as const;

interface BoardOrder {
  id: string;
  orderNumber: string;
  name: string;
  total: unknown; // Prisma Decimal — converted with Number() below
  status: string;
  createdAt: Date;
}

// Shown in Pakistan time regardless of where the server runs.
const formatPlaced = (date: Date) =>
  date.toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

interface ColumnProps {
  title: string;
  subtitle: string;
  accent: string;
  orders: BoardOrder[];
  emptyText: string;
  showStage?: boolean;
}

function Column({ title, subtitle, accent, orders, emptyText, showStage = false }: ColumnProps) {
  return (
    <div className={`flex flex-col rounded-lg border border-t-4 border-brown/10 bg-white shadow-sm ${accent}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-espresso">{title}</h3>
          <p className="text-xs text-brown/40">{subtitle}</p>
        </div>
        <span className="rounded-full bg-beige px-2.5 py-1 text-xs font-bold text-espresso">
          {orders.length}
        </span>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto px-3 pb-3">
        {orders.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-brown/40">{emptyText}</p>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="group block rounded-md border border-brown/10 p-3 hover:border-gold hover:bg-beige/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-espresso underline-offset-2 group-hover:underline">
                  #{order.orderNumber}
                </span>
                {showStage && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      STAGE_STYLES[order.status] ?? "bg-brown/10 text-brown"
                    }`}
                  >
                    {STAGE_LABELS[order.status] ?? order.status}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-brown/60">
                {order.name} · PKR {Math.round(Number(order.total)).toLocaleString("en-US")}
              </p>
              <p className="mt-0.5 text-[11px] text-brown/40">{formatPlaced(order.createdAt)}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// Three-column order board for the admin dashboard:
//   New Orders  — every pending order
//   Processing  — every order in an in-progress stage
//   Delivered   — the latest 7 delivered orders
// Each card links to that order's detail page. Columns are worked out from
// each order's current status, so changing a status moves the order
// between columns by itself.
export default async function OrderBoard() {
  const [newOrders, processingOrders, deliveredOrders] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: PENDING_STATUSES } },
      orderBy: { createdAt: "desc" },
      select: orderSelect,
    }),
    prisma.order.findMany({
      where: { status: { in: PROCESSING_STATUSES } },
      orderBy: { createdAt: "desc" },
      select: orderSelect,
    }),
    prisma.order.findMany({
      where: { status: "delivered" },
      orderBy: { createdAt: "desc" },
      take: DELIVERED_LIMIT,
      select: orderSelect,
    }),
  ]);

  return (
    <section className="mt-8">
      <AutoRefresh seconds={30} />

      <div className="flex items-end justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-brown/50">
          Order Board
        </h2>
        <p className="text-xs text-brown/40">Updates automatically every 30 seconds</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Column
          title="New Orders"
          subtitle="Pending — waiting to be confirmed"
          accent="border-t-yellow-400"
          orders={newOrders}
          emptyText="No new orders right now."
        />
        <Column
          title="Processing"
          subtitle="Processing, packing, out for delivery"
          accent="border-t-blue-500"
          orders={processingOrders}
          emptyText="Nothing in processing."
          showStage
        />
        <Column
          title="Delivered"
          subtitle={`Latest ${DELIVERED_LIMIT} delivered orders`}
          accent="border-t-green-500"
          orders={deliveredOrders}
          emptyText="No delivered orders yet."
        />
      </div>
    </section>
  );
}