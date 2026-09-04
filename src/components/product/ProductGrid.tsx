"use client";

import { useEffect, useState, type FormEvent } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useProductFilters } from "@/hooks/useProductFilters";

interface Product {
  id: string;
  name: string;
  price: string;
  discount: string | null;
  images: { imageUrl: string }[];
  sizes: { size: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductGrid() {
  const { filters, updateFilters, queryString } = useProductFilters();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products?${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setLimit(data.limit ?? 8);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setIsLoading(false));
  }, [queryString]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-2xl font-bold text-espresso">Our Collection</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-l-md border border-brown/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60 sm:w-48"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-r-md bg-gold px-3 py-2 text-sm font-semibold text-espresso hover:bg-gold/90"
            >
              🔍
            </button>
          </form>

          <select
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="rounded-md border border-brown/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-brown/40">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-sm text-brown/40">
          No products found. Try adjusting your search or filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => updateFilters({ page: filters.page - 1 })}
                className="rounded-md border border-brown/20 px-4 py-2 text-sm font-medium text-brown hover:border-gold hover:text-gold disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-brown/50">
                Page {filters.page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={filters.page >= totalPages}
                onClick={() => updateFilters({ page: filters.page + 1 })}
                className="rounded-md border border-brown/20 px-4 py-2 text-sm font-medium text-brown hover:border-gold hover:text-gold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}