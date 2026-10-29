"use client";

import Input from "@/components/ui/Input";

export interface AddressFormValues {
  name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  email: string;
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
  "Hyderabad",
  "Bahawalpur",
  "Sialkot",
  "Gujranwala",
  "Sargodha",
  "Sukkur",
  "Jhang",
  "Sheikhupura",
  "Rahim Yar Khan",
  "Dera Ghazi Khan",
  "Okara",
  "Mardan",
  "Kasur",
  "Mingora",
  "Muzaffarabad",
  "Gujrat",
  "Jhelum",
  "Others",
];

// Shipping information section of checkout — matches the checkout-page
// design (full name, phone, country, city, complete address).
export default function AddressForm({ values, errors, onChange }: AddressFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-espresso">Shipping Information</h2>

      <Input
        label="Full Name"
        placeholder="e.g. Sakhar ijaz"
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
<div>
  <label htmlFor="email" className="block text-sm font-medium text-espresso">
    Email <span className="text-xs text-brown/50">(Optional)</span>
  </label>
  <input
    id="email"
    type="email"
    placeholder="you@example.com"
    // 👇 Use the same pattern as your other inputs
    value={values.email || ""}
    onChange={(e) => onChange("email", e.target.value)} 
    className="mt-1 w-full rounded-md border border-brown/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
  />
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
          placeholder="Street address, apartment, block"
          className={`w-full rounded-md border bg-white px-4 py-3 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold/60 ${
            errors.address ? "border-red-500" : "border-brown/20"
          }`}
        />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
      </div>
    </div>
  );
}