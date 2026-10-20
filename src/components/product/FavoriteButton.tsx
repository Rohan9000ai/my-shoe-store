"use client";

import type { MouseEvent } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import type { FavoriteItem } from "@/types/favorites";

interface FavoriteButtonProps {
  product: FavoriteItem;
  // "icon": small round heart for product cards (appears on hover).
  // "full": labelled button for the product detail page.
  variant?: "icon" | "full";
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function FavoriteButton({ product, variant = "icon" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(product.productId);

  // Cards are wrapped in a link, so stop the click from navigating.
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isFav}
        className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
          isFav
            ? "border-red-300 bg-red-50 text-red-600"
            : "border-brown/20 text-brown hover:border-gold hover:text-gold"
        }`}
      >
        <HeartIcon filled={isFav} className="h-4 w-4" />
        {isFav ? "Saved to Favorites" : "Add to Favorites"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition-opacity hover:bg-white focus:opacity-100 ${
        isFav
          ? "text-red-500 opacity-100"
          : "text-brown opacity-100 md:opacity-0 md:group-hover:opacity-100"
      }`}
    >
      <HeartIcon filled={isFav} className="h-4 w-4" />
    </button>
  );
}