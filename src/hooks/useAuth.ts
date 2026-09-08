"use client";

import { useSession, signOut, signIn } from "next-auth/react";

// Thin convenience wrapper around next-auth's useSession, matching the
// pattern of useCart/useProductFilters — components read isAuthenticated
// /isAdmin/user directly instead of unpacking session.user.role everywhere.
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: session?.user?.role === "admin",
    signIn,
    signOut,
  };
}