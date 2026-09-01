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