// Shared cart types — used by CartContext, useCart, and any component
// that needs to shape cart data (e.g. AddToCartForm).

// A line as saved in the browser. The name/price/stock here are only a
// snapshot from the moment the item was added; the live values come from
// the server (see ItemAvailability).
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discount: number;
  size: string;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
}

export type ItemState = "available" | "out_of_stock" | "unavailable";

// What the server says about one cart line right now.
export interface ItemAvailability {
  productId: string;
  size: string;
  state: ItemState;
  stock: number;
  name: string;
  price: number;
  discount: number;
  imageUrl: string | null;
}

// A line that can be bought right now. Name, price and stock are the live
// values; quantity is capped to what is in stock (requestedQuantity is
// what the customer originally asked for).
export interface VisibleCartItem extends CartItem {
  requestedQuantity: number;
}

// A saved line that is out of stock or unavailable. It is hidden from the
// cart and totals but kept, so it comes back once it is available again.
export interface HiddenCartItem extends CartItem {
  reason: "out_of_stock" | "unavailable";
}

export interface CartContextValue {
  items: VisibleCartItem[];
  hiddenItems: HiddenCartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  // Removes the items that can currently be bought (what was just ordered).
  // Hidden items stay saved.
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  isValidating: boolean;
  refreshAvailability: () => Promise<void>;
}