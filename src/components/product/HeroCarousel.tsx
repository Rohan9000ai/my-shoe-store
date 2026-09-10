"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
  isActive: boolean;
}

interface HeroSettings {
  backgroundImage: string | null;
}

const AUTO_SLIDE_INTERVAL_MS = 3000;

// ✅ Default slides
const DEFAULT_SLIDES: Slide[] = [
  {
    id: "default-1",
    title: "Step Into Luxury",
    description: "Handcrafted shoes for the modern connoisseur, tailored from premium selected calfskin and designed in Milan.",
    ctaLabel: "Shop Now",
    ctaHref: "/products",
    order: 0,
    isActive: true,
  },
  {
    id: "default-2",
    title: "The Men's Collection",
    description: "Oxfords, Chelsea boots, and monk straps — heritage Italian craftsmanship for the modern gentleman.",
    ctaLabel: "Shop Men's",
    ctaHref: "/products?category=men",
    order: 1,
    isActive: true,
  },
  {
    id: "default-3",
    title: "The Women's Collection",
    description: "Stilettos, loafers, and sandals crafted from the world's finest full-grain leathers.",
    ctaLabel: "Shop Women's",
    ctaHref: "/products?category=women",
    order: 2,
    isActive: true,
  },
];

// ✅ Gradient classes as constants (will be available on server and client)
const GRADIENT_CLASSES = [
  "from-espresso via-brown to-gold/30",
  "from-brown via-espresso to-brown",
  "from-gold/30 via-brown to-espresso",
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [settings, setSettings] = useState<HeroSettings>({ backgroundImage: null });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ✅ Mark as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch slides and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, settingsRes] = await Promise.all([
          fetch("/api/hero/slides"),
          fetch("/api/hero/settings"),
        ]);

        if (slidesRes.ok) {
          const slidesData = await slidesRes.json();
          const activeSlides = slidesData.slides?.filter((s: Slide) => s.isActive) || [];
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData.settings || { backgroundImage: null });
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (slides.length <= 1 || isPaused || !isClient) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, isClient]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // ✅ Get gradient class with useMemo to prevent recalculation
  const gradientClass = useMemo(() => {
    return GRADIENT_CLASSES[activeIndex % GRADIENT_CLASSES.length];
  }, [activeIndex]);

  // ✅ Always show gradient - both server and client
  const backgroundClass = settings.backgroundImage && isClient
    ? "bg-transparent"
    : `bg-gradient-to-br ${gradientClass}`;

  return (
    <section 
      className={`relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] overflow-hidden ${backgroundClass}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image (if set by admin) */}
      {settings.backgroundImage && isClient && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={settings.backgroundImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={80}
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Fallback gradient overlay when image is set */}
      {settings.backgroundImage && isClient && (
        <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${gradientClass}`} />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : (
        <>
          {/* Slide Track */}
          <div
            className="flex h-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] transition-transform duration-700 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] w-full flex-shrink-0 items-center px-4 sm:px-8 md:px-12"
              >
                <div className="mx-auto max-w-2xl text-center sm:text-left">
                  <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-beige drop-shadow-lg">
                    {slide.title}
                  </h1>
                  
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-beige/90 max-w-md mx-auto sm:mx-0 drop-shadow-md">
                    {slide.description}
                  </p>
                  
                  <Link
                    href={slide.ctaHref}
                    className="mt-4 sm:mt-6 inline-block rounded-md bg-gold px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90 transition-colors min-h-[44px] min-w-[120px] shadow-lg"
                  >
                    {slide.ctaLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 flex -translate-x-1/2 gap-2 sm:gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goToSlide(index)}
                  className={`
                    h-2 sm:h-2.5 w-2 sm:w-2.5 rounded-full transition-all duration-300
                    ${index === activeIndex 
                      ? "bg-gold scale-110" 
                      : "bg-beige/40 hover:bg-beige/60"
                    }
                    min-h-[8px] min-w-[8px] sm:min-h-[10px] sm:min-w-[10px]
                  `}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}