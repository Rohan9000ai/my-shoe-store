"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/icons/SocialIcons";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const QUICK_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Atelier Process", href: "/atelier-process" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Care & Maintenance", href: "/care" },
  { label: "FAQ", href: "/faq" },
];

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  // Fetch all categories for footer
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // ✅ Add cache: 'no-store' to always get fresh data
        const response = await fetch("/api/categories/all", {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-espresso text-beige">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_2fr]">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-lg font-bold text-gold">LUXE SOLE</h3>
            <p className="mt-3 text-sm text-beige/70">
              Elevating the art of shoemaking with timeless, handcrafted designs.
              Each pair is meticulously constructed using heritage Italian
              techniques and the world&apos;s finest full-grain leathers.
            </p>
            <div className="mt-4 flex gap-4 text-beige/70">
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="https://tiktok.com" aria-label="TikTok" target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Categories - Dynamic */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gold">
              Categories
            </h4>
            {loading ? (
              <p className="mt-3 text-sm text-beige/40">Loading categories...</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-beige/70">
                {categories.length === 0 ? (
                  <li className="text-beige/40">No categories yet</li>
                ) : (
                  categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="hover:text-gold transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gold">
              Contact Info
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-beige/70">
              <li>concierge@luxesole.com</li>
              {whatsappNumber && <li>{whatsappNumber}</li>}
            </ul>
            <div className="mt-4 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-l-md border-none bg-beige/20 px-3 py-2 text-sm text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              <button className="rounded-r-md bg-gold px-4 py-2 text-sm font-semibold text-espresso hover:bg-gold/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-beige/10 pt-6 text-center text-xs text-beige/50">
          © {new Date().getFullYear()} LUXE SOLE. All rights reserved. Crafted for connoisseurs.
        </div>
      </div>
    </footer>
  );
}