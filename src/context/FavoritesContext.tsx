"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { FavoriteItem, FavoritesContextValue } from "@/types/favorites";

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const GUEST_KEY = "luxe-sole-favorites:guest";
const keyForUser = (userId: string) => `luxe-sole-favorites:${userId}`;

function readList(key: string): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: FavoriteItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage unavailable — favorites just won't persist.
  }
}

// Favorites are stored in the browser, separately per signed-in user
// (and a "guest" list when signed out). Anything a guest saved is merged
// into their account list the moment they log in.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const storageKey = status === "authenticated" && userId ? keyForUser(userId) : GUEST_KEY;

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && userId) {
      const own = readList(keyForUser(userId));
      const guest = readList(GUEST_KEY);

      if (guest.length > 0) {
        const merged = [
          ...own,
          ...guest.filter((g) => !own.some((o) => o.productId === g.productId)),
        ];
        writeList(keyForUser(userId), merged);
        try {
          localStorage.removeItem(GUEST_KEY);
        } catch {
          // ignore
        }
        setItems(merged);
      } else {
        setItems(own);
      }
    } else {
      setItems(readList(GUEST_KEY));
    }

    setIsHydrated(true);
  }, [status, userId]);

  const isFavorite = (productId: string) => items.some((i) => i.productId === productId);

  const toggleFavorite = (item: FavoriteItem) => {
    const next = isFavorite(item.productId)
      ? items.filter((i) => i.productId !== item.productId)
      : [item, ...items];
    setItems(next);
    writeList(storageKey, next);
  };

  const removeFavorite = (productId: string) => {
    const next = items.filter((i) => i.productId !== productId);
    setItems(next);
    writeList(storageKey, next);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites: items,
        favoritesCount: items.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        isHydrated,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}