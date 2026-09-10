"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bars3Icon, MagnifyingGlassIcon, HeartIcon } from "@heroicons/react/24/outline";
import SidePanel from "@/components/layout/SidePanel";
import CartButton from "@/components/layout/CartButton";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent categories (4 most recent)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // ✅ Add cache: 'no-store' to always get fresh data
        const response = await fetch("/api/categories/recent", {
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
    <>
      <header className="sticky top-0 z-40 border-b border-brown/10 bg-beige/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:text-gold transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              <Link
                href="/"
                className="font-heading text-xl sm:text-2xl font-bold tracking-wide text-espresso hover:text-gold transition-colors"
              >
                LUXE SOLE
              </Link>
            </div>

            {/* Desktop nav links - Home + Dynamic Categories */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-brown hover:text-gold transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-brown hover:text-gold transition-colors"
              >
                All Products
              </Link>
              {!loading && categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="text-sm font-medium text-brown hover:text-gold transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Right: icons + auth */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Cart Button */}
              <CartButton />

              {/* Auth & Admin */}
              {status === "authenticated" ? (
                <div className="hidden md:flex items-center gap-3">
                  {session.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-xs font-medium text-brown hover:text-gold transition-colors px-3 py-1.5 border border-brown/20 rounded hover:border-gold/50"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm font-medium text-brown hover:text-gold transition-colors"
                  >
                    {session.user?.name?.split(" ")[0] ?? "Account"} · Log Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:block text-sm font-medium text-brown hover:text-gold transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <SidePanel
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAuthenticated={status === "authenticated"}
        isAdmin={session?.user?.role === "admin"}
      />
    </>
  );
}