"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

// Cart icon with a live item-count badge, matching the top-right cart
// button from the design. Pulls the real count from CartContext, and
// briefly bumps in size whenever the count changes for visible feedback.
export default function CartButton() {
  const { itemCount } = useCart();
  const [isBumping, setIsBumping] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300);
    return () => clearTimeout(timer);
  }, [itemCount]);

  return (
    <Link href="/cart" aria-label="Cart" className="relative text-espresso hover:text-gold">
      🛍
      {itemCount > 0 && (
        <span
          className={`absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-espresso transition-transform duration-300 ${
            isBumping ? "scale-125" : "scale-100"
          }`}
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}