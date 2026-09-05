"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import AddressForm, { type AddressFormValues } from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import Button from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { checkoutAddressSchema } from "@/lib/validations";

type AddressField = keyof AddressFormValues;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [formData, setFormData] = useState<AddressFormValues>({
    name: "",
    phone: "",
    country: "Pakistan",
    city: "",
    address: "",
  });
  const [errors, setErrors] = useState<Partial<Record<AddressField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (field: AddressField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = checkoutAddressSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<AddressField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as AddressField;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    if (items.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
          shipping: result.data,
          paymentMethod: "cod",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation?orderId=${data.orderId}`);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-heading text-2xl font-bold text-espresso">Secure Checkout</h1>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3"
          noValidate
        >
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
              <AddressForm values={formData} errors={errors} onChange={handleChange} />
            </div>

            <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-espresso">Payment Method</h2>
              <label className="mt-4 flex items-center gap-3 rounded-md border border-gold bg-gold/10 p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked
                  readOnly
                  className="accent-gold"
                />
                <div>
                  <p className="text-sm font-semibold text-espresso">Cash on Delivery (COD)</p>
                  <p className="text-xs text-brown/50">
                    Pay with cash upon receiving your luxury package.
                  </p>
                </div>
              </label>
              <p className="mt-3 text-xs text-brown/40">
                For online bank transfers or credit cards, please contact us on WhatsApp.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
            <OrderSummary items={items} subtotal={subtotal} />

            {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={items.length === 0}
              className="mt-6"
            >
              Place Order
            </Button>
          </div>
        </form>

        <div className="mt-10 grid grid-cols-1 gap-4 text-center text-xs text-brown/50 sm:grid-cols-3">
          <p>
            🔒 100% Secure Checkout
            <br />
            Bank-Grade Encryption
          </p>
          <p>
            ↺ Free Worldwide Returns
            <br />
            Complimentary return shipping
          </p>
          <p>
            ✔ Authenticity Guaranteed
            <br />
            Hand-signed master craftsmanship
          </p>
        </div>
      </main>

      <Footer />
      <WhatsAppBubble />
    </>
  );
}