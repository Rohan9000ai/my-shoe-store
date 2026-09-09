import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SalesChart from "@/components/admin/SalesChart";

const LOW_STOCK_THRESHOLD = 5;
const CHART_DAYS = 14;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  packing: "Packing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  packing: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

// All stats are now live from the database — Order/OrderItem/ProductSize
// models all exist as of later build steps, so the earlier placeholders
// have been replaced with real queries.
export default async function AdminDashboardPage() {
  const [totalProducts, orders, lowStockCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ where: { status: { not: "cancelled" } } }),
    prisma.productSize.count({ where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;

  // Build a daily revenue series for the last CHART_DAYS days, filling
  // in PKR 0 for any day with no orders so the chart has no gaps.
  const chartStart = new Date();
  chartStart.setDate(chartStart.getDate() - (CHART_DAYS - 1));
  chartStart.setHours(0, 0, 0, 0);

  const dailyTotals = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const day = new Date(chartStart);
    day.setDate(chartStart.getDate() + i);
    dailyTotals.set(day.toDateString(), 0);
  }

  for (const order of orders) {
    if (order.createdAt >= chartStart) {
      const key = order.createdAt.toDateString();
      if (dailyTotals.has(key)) {
        dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + Number(order.total));
      }
    }
  }

  const chartData = Array.from(dailyTotals.entries()).map(([dateStr, total]) => ({
    label: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total,
  }));

  const stats = [
    { label: "Total Sales", value: `PKR ${totalSales.toLocaleString()}`, hint: "Live from database" },
    { label: "Total Orders", value: totalOrders.toLocaleString(), hint: "Live from database" },
    { label: "Total Products", value: totalProducts.toLocaleString(), hint: "Live from database" },
    {
      label: "Low Stock Alert",
      value: lowStockCount.toLocaleString(),
      hint: `Sizes with ≤ ${LOW_STOCK_THRESHOLD} units left`,
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-espresso">
        Dashboard Overview
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-brown/10 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brown/50">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-espresso">{stat.value}</p>
            <p className="mt-1 text-xs text-brown/40">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">
            Recent Atelier Orders
          </h2>

          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-brown/40">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-beige/40"
                >
                  <div>
                    <p className="font-medium text-espresso">#{order.orderNumber}</p>
                    <p className="text-xs text-brown/40">{order.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-espresso">
                      PKR {Number(order.total).toLocaleString()}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        STATUS_STYLES[order.status] ?? "bg-brown/10 text-brown"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">
            Atelier Performance
          </h2>
          <p className="mt-1 text-xs text-brown/40">Last {CHART_DAYS} days</p>
          <SalesChart data={chartData} />
        </div>
      </div>
    </div>
  );
}