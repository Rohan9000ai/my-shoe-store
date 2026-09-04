"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

// Placeholder values until the admin Settings page (delivery charge,
// free-delivery threshold) is built and wired to a real API — matches
// the example values shown in the admin-settings design.
const DELIVERY_CHARGE = 1500;
const FREE_DELIVERY_THRESHOLD = 50000;

export default function CartSummary() {
  const { subtotal, itemCount } = useCart();
  const deliveryCharge =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;

  return (
    <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-espresso">Order Summary</h2>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Promo code"
          className="flex-1 rounded-md border border-brown/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60"
        />
        <button
          type="button"
          className="rounded-md bg-brown px-4 py-2 text-sm font-semibold text-beige hover:bg-espresso"
        >
          Apply
        </button>
      </div>

      <div className="mt-6 space-y-2 border-t border-brown/10 pt-4 text-sm">
        <div className="flex justify-between text-brown/70">
          <span>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span>PKR {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-brown/70">
          <span>Delivery Charges</span>
          <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
            {deliveryCharge === 0 ? "Free" : `PKR ${deliveryCharge.toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-brown/10 pt-4 text-base font-semibold text-espresso">
        <span>Total Amount</span>
        <span>PKR {total.toLocaleString()}</span>
      </div>

      <Link
        href="/checkout"
        aria-disabled={itemCount === 0}
        className={`mt-6 block rounded-md py-3 text-center text-sm font-semibold uppercase tracking-wide ${
          itemCount === 0
            ? "pointer-events-none bg-brown/20 text-brown/40"
            : "bg-gold text-espresso hover:bg-gold/90"
        }`}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}