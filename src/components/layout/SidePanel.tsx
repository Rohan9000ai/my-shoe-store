"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all categories when panel opens
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const response = await fetch("/api/categories/all");
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Side panel - Full height with flex column */}
      <div className="flex flex-col w-72 h-full bg-espresso text-beige shadow-xl overflow-y-auto">
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between p-4 border-b border-beige/10 flex-shrink-0">
          <span className="font-heading text-lg font-bold text-gold">
            LUXE SOLE
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="p-2 text-beige hover:text-gold transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation - Scrollable middle section with ALL categories */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link
            href="/products"
            onClick={onClose}
            className="block px-4 py-2.5 text-sm font-medium text-beige/80 hover:text-gold hover:bg-beige/10 rounded-lg transition-colors"
          >
            All Products
          </Link>
          
          {loading ? (
            <div className="px-4 py-2 text-sm text-beige/40">Loading categories...</div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                onClick={onClose}
                className="block px-4 py-2.5 text-sm font-medium text-beige/80 hover:text-gold hover:bg-beige/10 rounded-lg transition-colors"
              >
                {category.name}
              </Link>
            ))
          )}
        </nav>

        {/* Footer - Sticks to bottom */}
        <div className="border-t border-beige/10 p-4 flex-shrink-0">
          {isAuthenticated ? (
            <div className="space-y-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="block w-full text-center rounded-lg bg-gold py-2.5 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90 transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-center rounded-lg border border-beige/30 py-2.5 text-sm font-semibold uppercase tracking-wide text-beige hover:bg-beige/10 transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={onClose}
                className="block w-full text-center rounded-lg bg-gold py-2.5 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="block w-full text-center rounded-lg border border-beige/30 py-2.5 text-sm font-semibold uppercase tracking-wide text-beige hover:bg-beige/10 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <button
        type="button"
        aria-label="Close menu overlay"
        onClick={onClose}
        className="flex-1 bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-colors"
      />
    </div>
  );
}