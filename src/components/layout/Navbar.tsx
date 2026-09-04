"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import SidePanel from "@/components/layout/SidePanel";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Men's", href: "/products?category=men" },
  { label: "Women's", href: "/products?category=women" },
  { label: "New Arrivals", href: "/products?category=new-arrivals" },
  { label: "Editorial", href: "/editorial" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = 0; // Wired up once CartContext (src/context/CartContext.tsx) exists

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brown/10 bg-beige/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Left: hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex flex-col gap-1.5 p-2"
          >
            <span className="block h-0.5 w-6 bg-espresso" />
            <span className="block h-0.5 w-6 bg-espresso" />
            <span className="block h-0.5 w-6 bg-espresso" />
          </button>

          {/* Center: logo */}
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-wide text-gold"
          >
            LUXE SOLE
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-espresso hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: search, wishlist, cart, auth */}
          <div className="flex items-center gap-4">
            <button aria-label="Search" className="text-espresso hover:text-gold">
              🔍
            </button>
            <button aria-label="Wishlist" className="text-espresso hover:text-gold">
              ♡
            </button>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-espresso hover:text-gold"
            >
              🛍
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-espresso">
                  {cartCount}
                </span>
              )}
            </Link>

            {status === "authenticated" ? (
              <div className="hidden items-center gap-3 md:flex">
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="rounded-md bg-brown px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-beige hover:bg-espresso"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-espresso hover:text-gold"
                >
                  {session.user?.name?.split(" ")[0] ?? "Account"} · Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden text-sm font-medium text-espresso hover:text-gold md:block"
              >
                Login
              </Link>
            )}
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