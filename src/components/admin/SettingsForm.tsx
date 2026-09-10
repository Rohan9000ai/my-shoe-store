"use client";

import { useEffect, useState, type FormEvent } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface SettingsValues {
  delivery_charge: string;
  free_delivery_threshold: string;
  tax_rate: string;
  handling_fee: string;
  whatsapp_number: string;
  store_name: string;
  store_email: string;
}

const DEFAULTS: SettingsValues = {
  delivery_charge: "1500",
  free_delivery_threshold: "50000",
  tax_rate: "0",
  handling_fee: "0",
  whatsapp_number: "",
  store_name: "Luxe Sole Store",
  store_email: "",
};

// Matches the admin-settings design: Delivery, Tax & Levies, WhatsApp
// Integration, and Corporate Address sections. Loads current values from
// /api/settings, saves each changed key back via the same endpoint
// (already supports upsert-by-key from an earlier task).
export default function SettingsForm() {
  const [values, setValues] = useState<SettingsValues>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const raw = data.raw ?? {};
        setValues({
          delivery_charge:
            raw.delivery_charge ?? String(data.deliveryCharge ?? DEFAULTS.delivery_charge),
          free_delivery_threshold:
            raw.free_delivery_threshold ??
            String(data.freeDeliveryThreshold ?? DEFAULTS.free_delivery_threshold),
          tax_rate: raw.tax_rate ?? String(data.taxRate ?? DEFAULTS.tax_rate),
          handling_fee: raw.handling_fee ?? DEFAULTS.handling_fee,
          whatsapp_number: raw.whatsapp_number ?? data.whatsappNumber ?? DEFAULTS.whatsapp_number,
          store_name: raw.store_name ?? DEFAULTS.store_name,
          store_email: raw.store_email ?? DEFAULTS.store_email,
        });
      })
      .catch(() => setValues(DEFAULTS))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: keyof SettingsValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const entries = Object.entries(values) as [keyof SettingsValues, string][];
      const results = await Promise.all(
        entries.map(([key, value]) =>
          fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value }),
          })
        )
      );

      const failed = results.some((res) => !res.ok);
      if (failed) {
        setError("Some settings could not be saved. Please try again.");
      } else {
        setMessage("Settings saved successfully.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWhatsApp = () => {
    const cleanNumber = values.whatsapp_number.replace(/[^0-9]/g, "");
    if (!cleanNumber) {
      setError("Enter a WhatsApp number first.");
      return;
    }
    window.open(
      `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
        "This is a test message from Luxe Sole Atelier Control."
      )}`,
      "_blank"
    );
  };

  if (isLoading) {
    return <p className="text-sm text-brown/40">Loading settings...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
      )}
      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso">Delivery Settings</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Default Delivery Charge (PKR)"
              type="number"
              min="0"
              value={values.delivery_charge}
              onChange={(e) => handleChange("delivery_charge", e.target.value)}
            />
            <Input
              label="Free Delivery Threshold Amount (PKR)"
              type="number"
              min="0"
              value={values.free_delivery_threshold}
              onChange={(e) => handleChange("free_delivery_threshold", e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso">Tax &amp; Settings</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Sales Tax Rate (%)"
              type="number"
              min="0"
              step="0.1"
              value={values.tax_rate}
              onChange={(e) => handleChange("tax_rate", e.target.value)}
            />
            <Input
              label="Custom Handling Fee (PKR)"
              type="number"
              min="0"
              value={values.handling_fee}
              onChange={(e) => handleChange("handling_fee", e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso">
            WhatsApp Integration Settings
          </h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Pakistan WhatsApp Helpline Number"
              placeholder="+92 300 1234567"
              value={values.whatsapp_number}
              onChange={(e) => handleChange("whatsapp_number", e.target.value)}
            />
            <Button type="button" variant="outline" onClick={handleTestWhatsApp}>
              Send Test WhatsApp Message
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso">
             Address Information
          </h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Store Name"
              value={values.store_name}
              onChange={(e) => handleChange("store_name", e.target.value)}
            />
            <Input
              label="Customer Support Email Address"
              type="email"
              value={values.store_email}
              onChange={(e) => handleChange("store_email", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-48">
          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}