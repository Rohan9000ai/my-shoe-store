"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

// Shown under the cart (and on checkout) when some saved items can't be
// bought right now. They are kept out of the cart and the total, and they
// reappear by themselves if they come back in stock. The customer can
// also remove them for good.
export default function UnavailableItems() {
  const { hiddenItems, removeItem } = useCart();

  if (hiddenItems.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-800">
        {hiddenItems.length === 1
          ? "1 item is not available right now"
          : `${hiddenItems.length} items are not available right now`}
      </p>
      <p className="mt-1 text-xs text-amber-700">
        They are left out of your cart and total. If they come back in stock, they will
        appear in your cart again automatically.
      </p>

      <ul className="mt-3 space-y-2">
        {hiddenItems.map((item) => (
          <li
            key={`${item.productId}-${item.size}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              {item.reason === "out_of_stock" ? (
                <Link
                  href={`/products/${item.productId}`}
                  className="block truncate text-amber-900 hover:underline"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="block truncate text-amber-900">{item.name}</span>
              )}
              <p className="text-xs text-amber-700">
                Size {item.size} · {item.reason === "out_of_stock" ? "Out of stock" : "No longer available"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.productId, item.size)}
              className="flex-shrink-0 text-xs font-medium text-amber-800 underline hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}