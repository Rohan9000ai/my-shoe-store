"use client";

import Link from "next/link";
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
    <div className="flex items-center gap-4 border-b border-brown/10 py-4 last:border-0">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-brown/5">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-brown/30">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.productId}`}
          className="block truncate text-sm font-medium text-espresso hover:text-gold"
        >
          {item.name}
        </Link>
        <p className="mt-1 text-xs text-brown/50">Size: {item.size}</p>
        <p className="mt-1 text-sm font-semibold text-espresso">
          PKR {unitPrice.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center rounded-md border border-brown/20">
        <button
          type="button"
          disabled={item.quantity <= 1}
          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
          className="px-2 py-1 text-brown hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <button
          type="button"
          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
          className="px-2 py-1 text-brown hover:text-gold"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <p className="w-24 flex-shrink-0 text-right text-sm font-semibold text-espresso">
        PKR {lineTotal.toLocaleString()}
      </p>

      <button
        type="button"
        onClick={() => removeItem(item.productId, item.size)}
        aria-label={`Remove ${item.name} from cart`}
        className="flex-shrink-0 text-red-500 hover:text-red-700"
      >
        🗑
      </button>
    </div>
  );
}