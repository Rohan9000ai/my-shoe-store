import Link from "next/link";
import Image from "next/image";
import ProductRowActions from "@/components/admin/ProductRowActions";
import { prisma } from "@/lib/prisma";

// Always read fresh data, so a status change shows up immediately.
export const dynamic = "force-dynamic";

type Filter = "" | "available" | "unavailable" | "out_of_stock";

const TABS: { label: string; value: Filter }[] = [
  { label: "All", value: "" },
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
  { label: "Out of Stock", value: "out_of_stock" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const requested = searchParams.status ?? "";
  const filter: Filter = TABS.some((tab) => tab.value === requested)
    ? (requested as Filter)
    : "";

  // Every product, whatever its status — nothing is filtered out in the
  // database query, so Unavailable products always stay in this list.
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      sizes: true,
    },
  });

  const rows = products.map((product) => {
    const totalStock = product.sizes.reduce((sum, size) => sum + size.stockQuantity, 0);
    const state: Exclude<Filter, ""> =
      product.status !== "available"
        ? "unavailable"
        : totalStock <= 0
          ? "out_of_stock"
          : "available";

    return { product, totalStock, state };
  });

  const counts: Record<string, number> = {
    all: rows.length,
    available: rows.filter((row) => row.state === "available").length,
    unavailable: rows.filter((row) => row.state === "unavailable").length,
    out_of_stock: rows.filter((row) => row.state === "out_of_stock").length,
  };

  const visible = filter ? rows.filter((row) => row.state === filter) : rows;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-espresso">Products Management</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90"
        >
          + Add New Product
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = filter === tab.value;
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/admin/products?status=${tab.value}` : "/admin/products"}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-espresso text-beige" : "bg-white text-brown hover:bg-brown/5"
              }`}
            >
              {tab.label}{" "}
              <span className={isActive ? "text-gold" : "text-brown/40"}>
                {counts[tab.value || "all"]}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-brown/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brown/10 text-xs uppercase tracking-wide text-brown/50">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brown/40">
                  {rows.length === 0
                    ? 'No products yet. Click "Add New Product" to create your first one.'
                    : "No products in this view."}
                </td>
              </tr>
            )}

            {visible.map(({ product, totalStock, state }) => {
              const thumbnail = product.images[0]?.imageUrl;

              return (
                <tr key={product.id} className="border-b border-brown/5 last:border-0">
                  <td className="px-4 py-3">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-brown/10" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-espresso">{product.name}</td>
                  <td className="px-4 py-3">PKR {Number(product.price).toLocaleString()}</td>
                  <td className="px-4 py-3">{totalStock}</td>
                  <td className="px-4 py-3">
                    {state === "unavailable" && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                        Unavailable
                      </span>
                    )}
                    {state === "out_of_stock" && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
                        Out of Stock
                      </span>
                    )}
                    {state === "available" && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Available
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions
                      productId={product.id}
                      productName={product.name}
                      status={product.status}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}