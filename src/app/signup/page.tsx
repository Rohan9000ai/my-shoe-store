"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signupSchema } from "@/lib/validations";

type Field = "name" | "email" | "phone" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<Field, string>>;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || undefined,
          password: result.data.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setFormError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-beige px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-brown/10 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-wide text-gold">
            LUXE SOLE
          </h1>
          <h2 className="mt-4 text-lg font-semibold text-espresso">Create Account</h2>
          <p className="mt-1 text-sm text-brown/70">
            Join our elite circle of connoisseurs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="Alexander Vance"
            value={formData.name}
            onChange={handleChange("name")}
            error={errors.name}
            autoComplete="name"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="alexander@luxury.com"
            value={formData.email}
            onChange={handleChange("email")}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="+92 300 1234567"
            value={formData.phone}
            onChange={handleChange("phone")}
            error={errors.phone}
            autoComplete="tel"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="At least 8 characters"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          {formError && <p className="text-center text-sm text-red-500">{formError}</p>}

          <Button type="submit" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-brown/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}