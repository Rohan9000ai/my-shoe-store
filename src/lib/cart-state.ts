import type {
  CartItem,
  HiddenCartItem,
  ItemAvailability,
  VisibleCartItem,
} from "@/types/cart";

export const MAX_CART_LINES = 50;

export const lineKey = (productId: string, size: string) => `${productId}::${size}`;

// Cleans whatever was saved in the browser: drops broken lines, fills in
// missing fields (older carts had no maxStock) and merges duplicates, so
// bad saved data can never break the cart.
export function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  const lines = new Map<string, CartItem>();

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;

    const productId = typeof e.productId === "string" ? e.productId : "";
    const size = typeof e.size === "string" ? e.size : "";
    const quantity = Math.floor(Number(e.quantity));
    const price = Number(e.price);
    const discount = Number(e.discount ?? 0);
    const maxStock = Math.floor(Number(e.maxStock));

    if (!productId || !size) continue;
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    if (!Number.isFinite(price) || price < 0) continue;

    const item: CartItem = {
      productId,
      size,
      quantity,
      price,
      discount: Number.isFinite(discount) && discount > 0 ? discount : 0,
      maxStock: Number.isFinite(maxStock) && maxStock > 0 ? maxStock : quantity,
      name: typeof e.name === "string" && e.name ? e.name : "Product",
      imageUrl: typeof e.imageUrl === "string" && e.imageUrl ? e.imageUrl : undefined,
    };

    const key = lineKey(productId, size);
    const existing = lines.get(key);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      lines.set(key, item);
    }
  }

  return Array.from(lines.values()).slice(0, MAX_CART_LINES);
}

// Splits the saved cart into what can be bought right now and what is
// hidden, using the server's latest answer. The saved lines are never
// changed here, so a hidden item returns by itself when it is back.
export function deriveCart(
  stored: CartItem[],
  availability: Record<string, ItemAvailability>
) {
  const items: VisibleCartItem[] = [];
  const hiddenItems: HiddenCartItem[] = [];

  for (const line of stored) {
    const info = availability[lineKey(line.productId, line.size)];

    // Not checked yet (just added, or the check is still running): show it
    // with the saved details instead of flickering it in and out.
    if (!info) {
      items.push({ ...line, requestedQuantity: line.quantity });
      continue;
    }

    if (info.state !== "available") {
      hiddenItems.push({ ...line, name: info.name || line.name, reason: info.state });
      continue;
    }

    const stock = Math.max(1, info.stock);

    items.push({
      ...line,
      name: info.name || line.name,
      price: info.price,
      discount: info.discount,
      imageUrl: info.imageUrl ?? line.imageUrl,
      maxStock: stock,
      quantity: Math.max(1, Math.min(line.quantity, stock)),
      requestedQuantity: line.quantity,
    });
  }

  return { items, hiddenItems };
}

export function cartTotals(items: VisibleCartItem[]) {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + (item.price - item.discount) * item.quantity, 0),
  };
}