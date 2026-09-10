"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

interface StoreSettings {
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  taxRate: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  deliveryCharge: 1500,
  freeDeliveryThreshold: 50000,
  taxRate: 0,
};

// Pulls delivery charge, free-delivery threshold, and tax rate from the
// real /api/settings endpoint — same source checkout's OrderSummary
// reads from, instead of hardcoded constants.
export default function CartSummary() {
  const { subtotal, itemCount } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          deliveryCharge: data.deliveryCharge ?? DEFAULT_SETTINGS.deliveryCharge,
          freeDeliveryThreshold:
            data.freeDeliveryThreshold ?? DEFAULT_SETTINGS.freeDeliveryThreshold,
          taxRate: data.taxRate ?? DEFAULT_SETTINGS.taxRate,
        });
      })
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setIsLoading(false));
  }, []);

  const deliveryCharge =
    subtotal === 0 || subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCharge;
  const tax = Math.round((subtotal * settings.taxRate) / 100);
  const total = subtotal + deliveryCharge + tax;

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
        {settings.taxRate > 0 && (
          <div className="flex justify-between text-brown/70">
            <span>Tax ({settings.taxRate}%)</span>
            <span>PKR {tax.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-brown/70">
          <span>Delivery Charges</span>
          <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
            {isLoading
              ? "…"
              : deliveryCharge === 0
                ? "Free"
                : `PKR ${deliveryCharge.toLocaleString()}`}
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