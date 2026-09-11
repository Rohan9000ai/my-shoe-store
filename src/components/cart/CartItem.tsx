"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

// One cart line: image, name, size, quantity stepper, line total, remove
// button. Talks directly to CartContext via useCart() rather than taking
// callback props, since every cart row needs the same actions.
export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const unitPrice = item.price - item.discount;
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex gap-3 sm:gap-4 border-b border-brown/10 py-4 last:border-0">
      {/* Product Image */}
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md bg-brown/5">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-brown/30">
            No image
          </div>
        )}
      </div>

      {/* Product Info + Actions */}
      <div className="min-w-0 flex-1">
        {/* Product name */}
        <Link
          href={`/products/${item.productId}`}
          className="block truncate text-sm sm:text-base font-medium text-espresso hover:text-gold"
        >
          {item.name}
        </Link>

        {/* Size */}
        <p className="mt-0.5 sm:mt-1 text-xs text-brown/50">
          Size: {item.size}
        </p>

        {/* Max stock warning */}
        {item.quantity >= item.maxStock && (
          <p className="text-xs text-red-500 mt-0.5">Max stock reached</p>
        )}

        {/* Price per unit */}
        <p className="mt-1 text-sm font-semibold text-espresso">
          PKR {unitPrice.toLocaleString()}
        </p>

        {/* Bottom row: Quantity + Delete + Line Total */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Quantity stepper */}
          <div className="flex items-center rounded-md border border-brown/20">
            <button
              type="button"
              disabled={item.quantity <= 1}
              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
              className="px-2.5 py-1.5 text-sm text-brown hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={item.quantity >= item.maxStock}
              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
              className="px-2.5 py-1.5 text-sm text-brown hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Line total */}
          <p className="text-sm font-semibold text-espresso whitespace-nowrap">
            PKR {lineTotal.toLocaleString()}
          </p>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => removeItem(item.productId, item.size)}
            aria-label={`Remove ${item.name} from cart`}
            className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}