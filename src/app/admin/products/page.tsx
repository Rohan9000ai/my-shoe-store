"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  price: number;
  status: string;
  images: { imageUrl: string }[];
  sizes: { stockQuantity: number }[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchProducts();
        router.refresh();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      alert("Error deleting product");
    }
  };

  // Toggle product status
  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "available" ? "unavailable" : "available";
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await fetchProducts();
        router.refresh();
      }
    } catch (error) {
      alert("Error updating product status");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-gold text-espresso rounded hover:bg-gold/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-espresso">
          Products Management
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90 transition-colors"
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
              const totalStock = product.sizes?.reduce(
                (sum, size) => sum + size.stockQuantity,
                0
              ) || 0;
              const thumbnail = product.images?.[0]?.imageUrl;

              return (
                <tr key={product.id} className="border-b border-brown/5 last:border-0 hover:bg-beige/20 transition-colors">
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
                      <div className="h-12 w-12 rounded-md bg-brown/10 flex items-center justify-center">
                        <span className="text-xs text-brown/40">No image</span>
                      </div>
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
                    <div className="flex items-center gap-2">
                      {/* Edit button */}
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-brown hover:text-gold transition-colors rounded-lg hover:bg-beige/50"
                        aria-label={`Edit ${product.name}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      
                      {/* Delete button */}
                      <button
                        className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <TrashIcon className="w-4 h-4" />
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