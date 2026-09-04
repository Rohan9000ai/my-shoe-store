"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Slide {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    title: "Step Into Luxury",
    description:
      "Handcrafted shoes for the modern connoisseur, tailored from premium selected calfskin and designed in Milan.",
    ctaLabel: "Shop Now",
    ctaHref: "/products",
    gradient: "from-espresso via-brown to-gold/30",
  },
  {
    id: "2",
    title: "The Men's Collection",
    description:
      "Oxfords, Chelsea boots, and monk straps — heritage Italian craftsmanship for the modern gentleman.",
    ctaLabel: "Shop Men's",
    ctaHref: "/products?category=men",
    gradient: "from-brown via-espresso to-brown",
  },
  {
    id: "3",
    title: "The Women's Collection",
    description:
      "Stilettos, loafers, and sandals crafted from the world's finest full-grain leathers.",
    ctaLabel: "Shop Women's",
    ctaHref: "/products?category=women",
    gradient: "from-gold/30 via-brown to-espresso",
  },
];

const AUTO_SLIDE_INTERVAL_MS = 5000;

// Auto-slides left every 5s: the track shifts translateX so each new
// slide enters from the right, matching the design's left-directional
// sliding hero. Dots below let the user jump to a slide manually.
export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      <div
        className="flex h-full min-h-[70vh] transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className={`flex min-h-[70vh] w-full flex-shrink-0 items-center bg-gradient-to-br ${slide.gradient} px-6 sm:px-12`}
          >
            <div className="mx-auto max-w-2xl">
              <h1 className="font-heading text-4xl font-bold text-beige sm:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-4 text-beige/80">{slide.description}</p>
              <Link
                href={slide.ctaHref}
                className="mt-6 inline-block rounded-md bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === activeIndex ? "bg-gold" : "bg-beige/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}