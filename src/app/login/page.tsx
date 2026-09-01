"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { loginSchema } from "@/lib/validations";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as "email" | "password";
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const response = await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (response?.error) {
      setFormError("Invalid email or password. Please try again.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-beige px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-brown/10 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-wide text-gold">
            LUXE SOLE
          </h1>
          <h2 className="mt-4 text-lg font-semibold text-espresso">Welcome Back</h2>
          <p className="mt-1 text-sm text-brown/70">
            Enter your credentials to access your master atelier drawer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="concierge@luxesole.com"
            value={formData.email}
            onChange={handleChange("email")}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            autoComplete="current-password"
          />

          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-brown/70 hover:text-gold">
              Forgot Password?
            </Link>
          </div>

          {formError && <p className="text-center text-sm text-red-500">{formError}</p>}

          <Button type="submit" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-brown/10" />
          <span className="text-xs text-brown/50">OR</span>
          <div className="h-px flex-1 bg-brown/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google")}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("apple")}
          >
            Apple ID
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-brown/70">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-gold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
