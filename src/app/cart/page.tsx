"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import UnavailableItems from "@/components/cart/UnavailableItems";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, hiddenItems, isHydrated, refreshAvailability } = useCart();

  // Always show fresh stock and prices when the cart page opens.
  useEffect(() => {
    if (isHydrated) {
      void refreshAvailability();
    }
  }, [isHydrated, refreshAvailability]);

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-heading text-2xl font-bold text-espresso">Shopping Cart</h1>

        {!isHydrated ? (
          <p className="mt-12 text-center text-sm text-brown/50">Loading your cart…</p>
        ) : items.length === 0 ? (
          <div className="mt-12">
            <div className="text-center">
              <p className="text-sm text-brown/50">
                {hiddenItems.length > 0
                  ? "None of the items in your cart are available right now."
                  : "Your cart is empty."}
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-md bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90"
              >
                Continue Shopping
              </Link>
            </div>

            {hiddenItems.length > 0 && (
              <div className="mx-auto mt-8 max-w-xl">
                <UnavailableItems />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-lg border border-brown/10 bg-white p-4 shadow-sm">
                {items.map((item) => (
                  <CartItem key={`${item.productId}-${item.size}`} item={item} />
                ))}
              </div>

              <UnavailableItems />
            </div>

            <CartSummary />
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppBubble />
    </>
  );
}