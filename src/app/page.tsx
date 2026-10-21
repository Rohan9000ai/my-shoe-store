import { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/product/HeroCarousel";
import CategoryRows from "@/components/product/CategoryRows";
import StickyCartButton from "@/components/layout/StickyCartButton";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ZTS Collections — Handcrafted Luxury Footwear",
  path: "/",
});

// Rebuild the category rows from the database at most once a minute, so
// new products show up without a redeploy.
export const revalidate = 60;

// ✅ Lazy load WhatsAppBubble - only loads when needed
const WhatsAppBubble = dynamic(
  () => import("@/components/layout/WhatsAppBubble"),
  { 
    ssr: false,
    loading: () => null // Don't show anything on mobile until loaded
  }
);

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero with priority loading */}
        <HeroCarousel />

        {/* One sliding row per category, streamed in with Suspense */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <CategoryRows />
        </Suspense>
      </main>

      <Footer />
      
      {/* WhatsApp loads lazily */}
      <WhatsAppBubble />

      {/* Floating cart button + "Open cart to checkout" hint */}
      <StickyCartButton showHint hintText="Open cart to checkout" />
    </>
  );
}

// ✅ Mobile-optimized skeleton
function ProductGridSkeleton() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            {/* Image skeleton */}
            <div className="aspect-square bg-brown/10 rounded-lg" />
            
            {/* Title skeleton */}
            <div className="h-3 bg-brown/10 rounded mt-2 w-3/4" />
            
            {/* Price skeleton */}
            <div className="h-4 bg-brown/10 rounded mt-1 w-1/3" />
          </div>
        ))}
      </div>
    </section>
  );
}