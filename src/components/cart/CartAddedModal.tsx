"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";

export interface AddedItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

interface CartAddedModalProps {
  open: boolean;
  onClose: () => void;
  item: AddedItem | null;
}

// Shown right after Add to Cart: confirms what was added, shows the cart
// total, and lets the customer go to Checkout or Continue Shopping
// (which returns to the home page).
export default function CartAddedModal({ open, onClose, item }: CartAddedModalProps) {
  const { itemCount, subtotal } = useCart();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-added-title"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2
            id="cart-added-title"
            className="flex items-center gap-2 font-heading text-lg font-bold text-espresso"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
              ✓
            </span>
            Added to your cart
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-brown/50 hover:text-brown"
          >
            &times;
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-md bg-beige/60 p-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-brown/5">
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-espresso">{item.name}</p>
            <p className="text-xs text-brown/60">
              Size {item.size} · Qty {item.quantity}
            </p>
            <p className="text-sm font-semibold text-espresso">
              PKR {(item.unitPrice * item.quantity).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-sm text-brown/70">
          <span>
            Cart total ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-semibold text-espresso">PKR {subtotal.toLocaleString()}</span>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
          <Link
            href="/"
            onClick={onClose}
            className="flex-1 rounded-md border border-brown/20 px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-brown hover:border-gold hover:text-gold"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            onClick={onClose}
            className="flex-1 rounded-md bg-gold px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}