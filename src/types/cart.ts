// Shared cart types — used by CartContext, useCart, and any component
// that needs to shape cart data (e.g. AddToCartForm).

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discount: number;
  size: string;
  quantity: number;
  imageUrl?: string;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}