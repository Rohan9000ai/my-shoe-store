"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

interface StickyCartButtonProps {
  // Lift the button higher so it clears the sticky Add to Cart bar
  // (used on the product detail page).
  raised?: boolean;
  // Show an arrow callout pointing at the button when the cart has items.
  showHint?: boolean;
  // Text inside the callout.
  hintText?: string;
}

export default function StickyCartButton({
  raised = false,
  showHint = false,
  hintText = "View Cart",
}: StickyCartButtonProps) {
  const { itemCount, isHydrated } = useCart();
  const hasItems = isHydrated && itemCount > 0;

  const [isBumping, setIsBumping] = useState(false);
  const isFirstRender = useRef(true);

  // Little pop on the badge whenever the count changes.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300);
    return () => clearTimeout(timer);
  }, [itemCount]);

  const positionClass = raised ? "bottom-[10.5rem]" : "bottom-24";

  return (
    <div className={`fixed right-6 z-30 flex items-center gap-3 ${positionClass}`}>
      {showHint && hasItems && (
        <Link
          href="/cart"
          className="animate-hint-nudge relative flex items-center gap-1.5 rounded-md bg-espresso px-3 py-2 text-xs font-semibold text-beige shadow-lg"
        >
          <span>{hintText}</span>
          <span aria-hidden="true" className="text-sm leading-none">
            →
          </span>
          <span
            aria-hidden="true"
            className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-espresso"
          />
        </Link>
      )}

      <Link
        href="/cart"
        aria-label={hasItems ? `View cart, ${itemCount} items` : "View cart"}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gold text-espresso shadow-lg hover:bg-gold/90 ${
          hasItems ? "animate-cart-shake" : ""
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        {itemCount > 0 && (
          <span
            className={`absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-espresso px-1 text-[11px] font-bold text-beige transition-transform duration-300 ${
              isBumping ? "scale-125" : "scale-100"
            }`}
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>
    </div>
  );
}