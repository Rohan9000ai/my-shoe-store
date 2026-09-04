import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import HeroCarousel from "@/components/product/HeroCarousel";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroCarousel />

        <section className="mx-auto max-w-7xl px-4 py-16">
          <p className="text-center text-sm text-brown/50">
            Product collections placeholder — coming in a later step.
          </p>
        </section>
      </main>

      <Footer />
      <WhatsAppBubble />
    </>
  );
}