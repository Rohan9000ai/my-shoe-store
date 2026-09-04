"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const MENU_LINKS = [
  { label: "Men's", href: "/products?category=men" },
  { label: "Women's", href: "/products?category=women" },
  { label: "Kids", href: "/products?category=kids" },
  { label: "New Arrivals", href: "/products?category=new-arrivals" },
  { label: "Sale", href: "/products?category=sale", badge: "SALE" },
  { label: "Accessories", href: "/products?category=accessories" },
];

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Hamburger side panel: category links + Login/Sign Up (or Admin
// Dashboard/Log Out when signed in), matching the hamburger-menu-overlay
// design. Navbar owns the open/closed state and passes it in.
export default function SidePanel({
  isOpen,
  onClose,
  isAuthenticated,
  isAdmin,
}: SidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex w-72 flex-col bg-espresso p-6 text-beige">
        <div className="mb-8 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-gold">
            LUXE SOLE
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="text-2xl leading-none text-beige"
          >
            &times;
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-medium hover:text-gold"
            >
              {link.label}
              {link.badge && (
                <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-espresso">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="rounded-md bg-gold py-3 text-center text-sm font-semibold uppercase tracking-wide text-espresso"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-beige/30 py-3 text-sm font-semibold uppercase tracking-wide"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="rounded-md bg-gold py-3 text-center text-sm font-semibold uppercase tracking-wide text-espresso"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="rounded-md border border-beige/30 py-3 text-center text-sm font-semibold uppercase tracking-wide"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <button
        type="button"
        aria-label="Close menu overlay"
        onClick={onClose}
        className="flex-1 bg-black/40"
      />
    </div>
  );
}