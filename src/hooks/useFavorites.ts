"use client";

import { useContext } from "react";
import { FavoritesContext } from "@/context/FavoritesContext";

// Convenience wrapper around FavoritesContext — throws a clear error if
// used outside FavoritesProvider, same pattern as useCart.
export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}