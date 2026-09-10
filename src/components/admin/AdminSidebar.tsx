"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PhotoIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon },
  { label: "Products", href: "/admin/products", icon: ShoppingBagIcon },
  { label: "Categories", href: "/admin/categories", icon: TagIcon },
  { label: "Hero", href: "/admin/hero", icon: PhotoIcon }, // ✅ Added Hero
  { label: "Orders", href: "/admin/orders", icon: ShoppingCartIcon },
  { label: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
  { label: "Reports", href: "/admin/reports", icon: ChartBarIcon },
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col justify-between overflow-y-auto bg-espresso text-beige transition-transform duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0 ${
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
                Admin Control
              </p>
            </div>
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={closeMobile}
              className="text-xl leading-none text-beige md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gold text-espresso"
                      : "text-beige/80 hover:bg-beige/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-beige/10 p-4 space-y-2">
          <Link
            href="/"
            onClick={closeMobile}
            className="flex items-center gap-2 px-2 py-2 text-sm text-beige/70 hover:text-gold transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 rounded-md border border-beige/20 px-3 py-2 text-sm font-medium text-beige/80 hover:bg-beige/10 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}