"use client";

import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import type { CartItem } from "@/types/cart";

export type { CartItem };

// Convenience wrapper around CartContext — throws a clear error if used
// outside CartProvider, instead of a silent undefined bug.
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}