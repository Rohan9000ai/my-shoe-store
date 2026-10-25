import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SalesChart from "@/components/admin/SalesChart";
import { getDashboardStats, getDailySales } from "@/services/dashboard.service";

// Always read fresh numbers from the database. Without this, Vercel can
// freeze the dashboard at whatever it showed when the site was last built.
export const dynamic = "force-dynamic";

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

const money = (amount: number) => `PKR ${Math.round(amount).toLocaleString("en-US")}`;
const orderCount = (n: number) => `${n} ${n === 1 ? "order" : "orders"}`;

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}

function StatCard({ label, value, hint, accent = "border-l-brown/30" }: StatCardProps) {
  return (
    <div className={`rounded-lg border border-l-4 border-brown/10 bg-white p-5 shadow-sm ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-brown/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-espresso">{value}</p>
      {hint && <p className="mt-1 text-xs text-brown/40">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-brown/50">
      {children}
    </h2>
  );
}

export default async function AdminDashboardPage() {
  const [stats, totalProducts, lowStockCount, recentOrders, chartData] = await Promise.all([
    getDashboardStats(),
    prisma.product.count(),
    prisma.productSize.count({ where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    getDailySales(CHART_DAYS),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-espresso">Dashboard Overview</h1>

      <SectionTitle>Payments</SectionTitle>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={money(stats.totalSales)}
          hint="Confirmed & delivered orders only"
          accent="border-l-gold"
        />
        <StatCard
          label="Pending Payments"
          value={money(stats.pending.amount)}
          hint={`${orderCount(stats.pending.count)} awaiting confirmation — not in sales`}
          accent="border-l-yellow-400"
        />
        <StatCard
          label="Confirmed / Delivered Payments"
          value={money(stats.confirmed.amount)}
          hint={`${orderCount(stats.confirmed.count)} — counted in Total Sales`}
          accent="border-l-green-500"
        />
        <StatCard
          label="Cancelled Payments"
          value={money(stats.cancelled.amount)}
          hint={`${orderCount(stats.cancelled.count)} — removed from sales`}
          accent="border-l-red-400"
        />
      </div>

      <SectionTitle>Orders</SectionTitle>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders.toLocaleString()} hint="All statuses" />
        <StatCard
          label="Pending Orders"
          value={stats.pending.count.toLocaleString()}
          accent="border-l-yellow-400"
        />
        <StatCard
          label="Confirmed / Delivered Orders"
          value={stats.confirmed.count.toLocaleString()}
          accent="border-l-green-500"
        />
        <StatCard
          label="Cancelled Orders"
          value={stats.cancelled.count.toLocaleString()}
          accent="border-l-red-400"
        />
      </div>

      <SectionTitle>Delivery &amp; Inventory</SectionTitle>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Delivery Charges"
          value={money(stats.totalDeliveryCharges)}
          hint={`All orders · Delivered ${money(stats.deliveredDeliveryCharges)} · Cancelled ${money(
            stats.cancelled.deliveryCharges
          )}`}
        />
        <StatCard label="Total Products" value={totalProducts.toLocaleString()} />
        <StatCard
          label="Low Stock Alert"
          value={lowStockCount.toLocaleString()}
          hint={`Sizes with ≤ ${LOW_STOCK_THRESHOLD} units left`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">
            Recent Orders
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
                    <span className="text-espresso">{money(Number(order.total))}</span>
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
            Sales Performance
          </h2>
          <p className="mt-1 text-xs text-brown/40">
            Last {CHART_DAYS} days · confirmed &amp; delivered only
          </p>
          <SalesChart data={chartData} />
        </div>
      </div>
    </div>
  );
}