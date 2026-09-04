import { z } from "zod";

// Shared phone regex per project validation rules
const phoneRegex = /^\+?[0-9]{10,15}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Name must be under 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address")
      .max(255, "Email must be under 255 characters"),
    phone: z
      .string()
      .regex(phoneRegex, "Enter a valid phone number (e.g. +923001234567)")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

// Server-side schema for the register API route. Deliberately omits
// confirmPassword — matching passwords is a client-only UX concern,
// the API never receives (or needs) that field.
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid phone number (e.g. +923001234567)")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Product create/edit — used by the admin ProductForm's API routes.
export const productImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  altText: z.string().optional().or(z.literal("")),
  position: z.number().int().min(0),
});

export const productSizeSchema = z.object({
  size: z.string().min(1, "Size is required").max(20),
  stockQuantity: z.coerce.number().int().min(0, "Stock must be 0 or more"),
  sku: z.string().max(50).optional().or(z.literal("")),
});

export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required").max(255),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discount: z.coerce.number().min(0).optional(),
    status: z.enum(["available", "unavailable"]).default("available"),
    categoryIds: z.array(z.string()).optional().default([]),
    images: z.array(productImageSchema).min(1, "Add at least one image"),
    sizes: z.array(productSizeSchema).min(1, "Add at least one size"),
  })
  .refine(
    (data) => data.discount === undefined || data.discount < data.price,
    { message: "Discount must be less than the regular price", path: ["discount"] }
  );

export type ProductInput = z.infer<typeof productSchema>;

// Query-string filters for GET /api/products (search, category, price range,
// pagination). Coerced from string query params into real types.
export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["available", "unavailable"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;

// Category create — name required, unique; slug auto-generated on the
// server from the name if not provided.
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name must be under 100 characters"),
  slug: z.string().max(120).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;