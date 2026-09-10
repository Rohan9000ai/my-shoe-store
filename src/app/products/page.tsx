import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import ProductGrid from "@/components/product/ProductGrid";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shop All Products",
  path: "/products",
});

// General product listing page — reuses ProductGrid (search/category/
// price filters already built in) so links like /products?category=men
// from the Navbar and hamburger menu actually resolve instead of 404ing.
export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <main>
        <Suspense
          fallback={
            <p className="py-12 text-center text-sm text-brown/40">
              Loading products...
            </p>
          }
        >
          <ProductGrid />
        </Suspense>
      </main>

      <Footer />
      <WhatsAppBubble />
    </>
  );
}