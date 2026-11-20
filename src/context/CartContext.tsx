"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartContextValue, ItemAvailability } from "@/types/cart";
import {
  MAX_CART_LINES,
  cartTotals,
  deriveCart,
  lineKey,
  sanitizeItems,
} from "@/lib/cart-state";

export type { CartItem, CartContextValue } from "@/types/cart";

export const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "luxe-sole-cart";
const CHECK_INTERVAL_MS = 45_000; // re-check availability this often while the tab is open
const MIN_GAP_MS = 10_000; // ...but never more often than this

// The cart is saved in the browser (so it survives reloads), and checked
// against the server for availability:
//   - lines that are out of stock / unavailable are HIDDEN from the cart,
//     the count and the totals, but stay saved;
//   - when they are back in stock and available they show up again;
//   - price, name and stock always come from the server, so the cart never
//     shows an out-of-date price or lets someone ask for more than exists.
export function CartProvider({ children }: { children: ReactNode }) {
  const [storedItems, setStoredItems] = useState<CartItem[]>([]);
  const [availability, setAvailability] = useState<Record<string, ItemAvailability>>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [checkTick, setCheckTick] = useState(0);

  const storedRef = useRef<CartItem[]>([]);
  const requestIdRef = useRef(0);
  const lastCheckRef = useRef(0);
  const lastWrittenRef = useRef<string | null>(null);

  useEffect(() => {
    storedRef.current = storedItems;
  }, [storedItems]);

  // Load the saved cart once, cleaning anything broken.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStoredItems(sanitizeItems(JSON.parse(saved)));
      }
    } catch {
      // Corrupt or unavailable storage — the cart just starts empty.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save the cart whenever it changes.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const serialized = JSON.stringify(storedItems);
      lastWrittenRef.current = serialized;
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Storage full or blocked — nothing more we can do.
    }
  }, [storedItems, isHydrated]);

  // Keep several open tabs in sync, so one tab can't overwrite the other's
  // changes with an old copy of the cart.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === lastWrittenRef.current) return;

      try {
        setStoredItems(event.newValue ? sanitizeItems(JSON.parse(event.newValue)) : []);
      } catch {
        setStoredItems([]);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Asks the server about every saved line. A failed check never hides
  // anything: we keep showing what we last knew.
  const runCheck = useCallback(async () => {
    const lines = storedRef.current;

    if (lines.length === 0) {
      setAvailability({});
      return;
    }

    const requestId = ++requestIdRef.current;
    lastCheckRef.current = Date.now();
    setIsValidating(true);

    try {
      const response = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({ productId: line.productId, size: line.size })),
        }),
      });

      if (!response.ok) return;

      const data = (await response.json()) as { items?: ItemAvailability[] };

      // A newer check has started since — ignore this older answer.
      if (requestId !== requestIdRef.current) return;

      const next: Record<string, ItemAvailability> = {};
      for (const info of data.items ?? []) {
        next[lineKey(info.productId, info.size)] = info;
      }
      setAvailability(next);
    } catch {
      // Offline or server error — keep the cart as it is.
    } finally {
      if (requestId === requestIdRef.current) {
        setIsValidating(false);
      }
    }
  }, []);

  // Check when the cart first loads, when different items are in it, and
  // when something was just added.
  const keysSignature = useMemo(
    () => storedItems.map((line) => lineKey(line.productId, line.size)).sort().join("|"),
    [storedItems]
  );

  useEffect(() => {
    if (!isHydrated) return;
    void runCheck();
  }, [isHydrated, keysSignature, checkTick, runCheck]);

  // Check again every so often, and when the customer comes back to the
  // tab, so stock changes show up without a reload.
  useEffect(() => {
    if (!isHydrated) return;

    const maybeCheck = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCheckRef.current < MIN_GAP_MS) return;
      void runCheck();
    };

    const timer = setInterval(maybeCheck, CHECK_INTERVAL_MS);
    window.addEventListener("focus", maybeCheck);
    document.addEventListener("visibilitychange", maybeCheck);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", maybeCheck);
      document.removeEventListener("visibilitychange", maybeCheck);
    };
  }, [isHydrated, runCheck]);

  const refreshAvailability = useCallback(async () => {
    await runCheck();
  }, [runCheck]);

  const { items, hiddenItems } = useMemo(
    () => deriveCart(storedItems, availability),
    [storedItems, availability]
  );

  const { itemCount, subtotal } = useMemo(() => cartTotals(items), [items]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    const cap = Math.max(1, item.maxStock);

    setStoredItems((prev) => {
      const index = prev.findIndex(
        (line) => line.productId === item.productId && line.size === item.size
      );

      if (index !== -1) {
        const updated = [...prev];
        const existing = updated[index];
        updated[index] = {
          ...existing,
          ...item,
          quantity: Math.min(Math.min(existing.quantity, cap) + quantity, cap),
        };
        return updated;
      }

      if (prev.length >= MAX_CART_LINES) return prev;

      return [...prev, { ...item, quantity: Math.min(quantity, cap) }];
    });

    // Forget what we knew about this line and check it again right away.
    const key = lineKey(item.productId, item.size);
    setAvailability((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setCheckTick((tick) => tick + 1);
  };

  const removeItem: CartContextValue["removeItem"] = (productId, size) => {
    setStoredItems((prev) =>
      prev.filter((line) => !(line.productId === productId && line.size === size))
    );
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (productId, size, quantity) => {
    const info = availability[lineKey(productId, size)];
    const liveStock = info && info.state === "available" ? info.stock : undefined;

    setStoredItems((prev) =>
      prev
        .map((line) =>
          line.productId === productId && line.size === size
            ? { ...line, quantity: Math.min(quantity, liveStock ?? line.maxStock) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  // Removes what can currently be bought (i.e. what was just ordered).
  // Hidden items stay saved, so they are not lost by placing an order.
  const clearCart = () => {
    const bought = new Set(items.map((item) => lineKey(item.productId, item.size)));
    setStoredItems((prev) => prev.filter((line) => !bought.has(lineKey(line.productId, line.size))));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        hiddenItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isHydrated,
        isValidating,
        refreshAvailability,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}