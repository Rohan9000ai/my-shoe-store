import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Real product list — queries Supabase via Prisma. Each product's first
// image (by position) and total stock (summed across sizes) are included.
export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      sizes: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-espresso">
          Products Management
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90"
        >
          + Add New Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-brown/10 bg-white shadow-sm">
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
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brown/40">
                  No products yet. Click &quot;Add New Product&quot; to create your first one.
                </td>
              </tr>
            )}

            {products.map((product) => {
              const totalStock = product.sizes.reduce(
                (sum, size) => sum + size.stockQuantity,
                0
              );
              const thumbnail = product.images[0]?.imageUrl;

              return (
                <tr key={product.id} className="border-b border-brown/5 last:border-0">
                  <td className="px-4 py-3">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnail}
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-brown/10" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-espresso">
                    {product.name}
                  </td>
                  <td className="px-4 py-3">
                    PKR {Number(product.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{totalStock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        product.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {product.status === "available" ? "Active" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-brown hover:text-gold"
                        aria-label={`Edit ${product.name}`}
                      >
                        ✎
                      </Link>
                      <button
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Delete ${product.name}`}
                      >
                        🗑
                      </button>
                    </div>
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