import Link from "next/link";
import OrderTable from "@/components/admin/OrderTable";
import { prisma } from "@/lib/prisma";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const status = searchParams.status ?? "";
  const search = searchParams.search ?? "";

  const [orders, allCount, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countMap: Record<string, number> = { all: allCount };
  for (const row of statusCounts) {
    countMap[row.status] = row._count.status;
  }

  const buildHref = (tabValue: string) => {
    const params = new URLSearchParams();
    if (tabValue) params.set("status", tabValue);
    if (search) params.set("search", search);
    const query = params.toString();
    return `/admin/orders${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-espresso">Orders Registry</h1>

        <form method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search order, customer, phone..."
            className="w-full rounded-md border border-brown/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60 sm:w-64"
          />
          <button
            type="submit"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-espresso hover:bg-gold/90"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.label}
              href={buildHref(tab.value)}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-espresso text-beige" : "bg-white text-brown hover:bg-brown/5"
              }`}
            >
              {tab.label}{" "}
              <span className={isActive ? "text-gold" : "text-brown/40"}>
                {countMap[tab.value || "all"] ?? 0}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}