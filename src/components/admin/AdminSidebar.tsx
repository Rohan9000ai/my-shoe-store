"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "🛍" },
  { label: "Categories", href: "/admin/categories", icon: "🏷" },
  { label: "Orders", href: "/admin/orders", icon: "📦" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
];

// Responsive: static full-height sidebar on md+ screens (desktop admin
// work), off-canvas drawer on mobile toggled by a floating hamburger
// button, since the fixed-width layout would otherwise break small
// screens entirely.
export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        aria-label="Open admin menu"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-md bg-espresso text-beige shadow-md md:hidden"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin menu overlay"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col justify-between bg-espresso text-beige transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-beige/10 px-6 py-6">
            <div>
              <h1 className="font-heading text-lg font-bold tracking-wide text-gold">
                LUXE SOLE
              </h1>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-beige/50">
                Atelier Control
              </p>
            </div>
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={closeMobile}
              className="text-xl leading-none text-beige md:hidden"
            >
              &times;
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-gold text-espresso"
                    : "text-beige/80 hover:bg-beige/10"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-beige/10 p-4">
          <Link
            href="/"
            onClick={closeMobile}
            className="block px-2 py-2 text-sm text-beige/70 hover:text-gold"
          >
            ← View Atelier Shop
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-1 w-full rounded-md border border-beige/20 px-3 py-2 text-sm font-medium text-beige/80 hover:bg-beige/10"
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}