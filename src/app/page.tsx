import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import HeroCarousel from "@/components/product/HeroCarousel";
import ProductGrid from "@/components/product/ProductGrid";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroCarousel />

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