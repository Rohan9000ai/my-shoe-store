"use client";

import Input from "@/components/ui/Input";

export interface AddressFormValues {
  name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
}

interface AddressFormProps {
  values: AddressFormValues;
  errors: Partial<Record<keyof AddressFormValues, string>>;
  onChange: (field: keyof AddressFormValues, value: string) => void;
}

const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

// Shipping information section of checkout — matches the checkout-page
// design (full name, phone, country, city, complete address).
export default function AddressForm({ values, errors, onChange }: AddressFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-espresso">Shipping Information</h2>

      <Input
        label="Full Name"
        placeholder="e.g. Alexander Vance"
        value={values.name}
        onChange={(e) => onChange("name", e.target.value)}
        error={errors.name}
      />

      <div>
        <Input
          label="Phone Number"
          placeholder="e.g. +92 300 1234567"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          error={errors.phone}
        />
        <p className="mt-1 text-xs text-brown/40">
          Phone number is required for delivery notifications.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Country"
          value={values.country}
          onChange={(e) => onChange("country", e.target.value)}
          error={errors.country}
        />

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-espresso">
            City
          </label>
          <select
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={`w-full rounded-md border bg-white px-4 py-3 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold/60 ${
              errors.city ? "border-red-500" : "border-brown/20"
            }`}
          >
            <option value="">Select City</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-espresso">
          Complete Address
        </label>
        <textarea
          value={values.address}
          onChange={(e) => onChange("address", e.target.value)}
          rows={3}
          placeholder="Street address, apartment, suite, block"
          className={`w-full rounded-md border bg-white px-4 py-3 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold/60 ${
            errors.address ? "border-red-500" : "border-brown/20"
          }`}
        />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
      </div>
    </div>
  );
}