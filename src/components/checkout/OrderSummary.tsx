"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/types/cart";

interface StoreSettings {
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  taxRate: number;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  deliveryCharge: 1500,
  freeDeliveryThreshold: 50000,
  taxRate: 0,
};

// Order summary for checkout — pulls delivery charge, free-delivery
// threshold, and tax rate from the real /api/settings endpoint instead
// of hardcoded constants, so admin changes reflect here automatically.
// Presentation only — the parent page supplies the surrounding card and
// the Place Order button, since those need form/submit state this
// component doesn't own.
export default function OrderSummary({ items, subtotal }: OrderSummaryProps) {
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
    <>
      <h2 className="font-heading text-lg font-bold text-espresso">Order Summary</h2>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
            <div>
              <p className="font-medium text-espresso">{item.name}</p>
              <p className="text-xs text-brown/40">
                Size {item.size} · Qty {item.quantity}
              </p>
            </div>
            <span className="text-espresso">
              PKR {((item.price - item.discount) * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-brown/40">Your cart is empty.</p>}
      </div>

      <div className="mt-4 space-y-2 border-t border-brown/10 pt-4 text-sm">
        <div className="flex justify-between text-brown/70">
          <span>Subtotal</span>
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
    </>
  );
}