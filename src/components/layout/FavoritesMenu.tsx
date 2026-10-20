"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/hooks/useFavorites";

// Heart icon for the navbar with a count badge; opens a dropdown listing
// everything the current user has favorited.
export default function FavoritesMenu() {
  const { favorites, favoritesCount, removeFavorite } = useFavorites();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    // On small screens the wrapper is not positioned, so the panel spans
    // the (sticky) header instead of overflowing the screen edge.
    <div ref={wrapperRef} className="md:relative">
      <button
        type="button"
        aria-label="Favorites"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative text-espresso hover:text-gold"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={favoritesCount > 0 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {favoritesCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {favoritesCount > 9 ? "9+" : favoritesCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full z-50 mt-2 rounded-lg border border-brown/10 bg-white shadow-xl md:left-auto md:right-0 md:w-80">
          <div className="flex items-center justify-between border-b border-brown/10 px-4 py-3">
            <p className="text-sm font-semibold text-espresso">
              Your Favorites ({favoritesCount})
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close favorites"
              className="text-xl leading-none text-brown/50 hover:text-brown"
            >
              &times;
            </button>
          </div>

          {favorites.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-brown/50">
              No favorites yet. Tap the heart on any product to save it here.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-brown/5 overflow-y-auto">
              {favorites.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 px-4 py-3">
                  <Link
                    href={`/products/${item.productId}`}
                    onClick={() => setOpen(false)}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-brown/5">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-espresso">{item.name}</p>
                      <p className="text-xs text-brown/60">
                        PKR {(item.price - item.discount).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFavorite(item.productId)}
                    aria-label={`Remove ${item.name} from favorites`}
                    className="text-xl leading-none text-brown/40 hover:text-red-500"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}