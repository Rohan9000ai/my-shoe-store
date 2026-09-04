"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  page: number;
}

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  page: 1,
};

// Reads/writes product filters (search, category, price range, page) to
// and from the URL query string, so filtered views are shareable and
// survive back/forward navigation — rather than living in component state.
export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ProductFilters = useMemo(
    () => ({
      search: searchParams.get("search") ?? DEFAULT_FILTERS.search,
      category: searchParams.get("category") ?? DEFAULT_FILTERS.category,
      minPrice: searchParams.get("minPrice") ?? DEFAULT_FILTERS.minPrice,
      maxPrice: searchParams.get("maxPrice") ?? DEFAULT_FILTERS.maxPrice,
      page: Number(searchParams.get("page") ?? DEFAULT_FILTERS.page),
    }),
    [searchParams]
  );

  const updateFilters = useCallback(
    (updates: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Any filter change other than an explicit page update resets to page 1
      if (!("page" in updates)) {
        params.delete("page");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    params.set("page", String(filters.page));
    params.set("limit", "8");
    return params.toString();
  }, [filters]);

  return { filters, updateFilters, queryString };
}