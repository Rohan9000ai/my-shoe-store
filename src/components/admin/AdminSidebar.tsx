"use client";

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

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="flex h-screen w-60 flex-col justify-between bg-espresso text-beige">
      <div>
        <div className="border-b border-beige/10 px-6 py-6">
          <h1 className="font-heading text-lg font-bold tracking-wide text-gold">
            LUXE SOLE
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-beige/50">
            Atelier Control
          </p>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
  );
}