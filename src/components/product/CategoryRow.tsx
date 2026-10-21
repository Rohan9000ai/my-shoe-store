"use client";

import { useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";

interface RowProduct {
  id: string;
  name: string;
  price: number;
  discount: number | null;
  images: { imageUrl: string }[];
  sizes: { size: string }[];
}

interface CategoryRowProps {
  name: string;
  slug: string;
  products: RowProduct[];
}

// One category row: title + "View All" link, and a horizontally
// scrolling strip of product cards (swipe on phones, arrow buttons on
// desktop).
export default function CategoryRow({ name, slug, products }: CategoryRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-espresso sm:text-2xl">
          {name}
        </h2>
        <Link
          href={`/products?category=${encodeURIComponent(slug)}`}
          className="text-sm font-semibold uppercase tracking-wide text-espresso underline underline-offset-4 hover:text-gold"
        >
          View All
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label={`Scroll ${name} left`}
          onClick={() => scrollByPage(-1)}
          className="absolute -left-3 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-espresso shadow-md hover:text-gold md:flex"
        >
          ‹
        </button>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="w-44 flex-shrink-0 snap-start sm:w-56 lg:w-64">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label={`Scroll ${name} right`}
          onClick={() => scrollByPage(1)}
          className="absolute -right-3 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-espresso shadow-md hover:text-gold md:flex"
        >
          ›
        </button>
      </div>
    </div>
  );
}