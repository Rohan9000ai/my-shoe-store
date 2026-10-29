// A product is "out of stock" when every one of its sizes is at 0.
// A product with no sizes at all has nothing to buy, so it counts too.
// Callers that don't pass stockQuantity are treated as in stock.
export function isOutOfStock(sizes: { stockQuantity?: number | null }[]): boolean {
  return sizes.every((size) => (size.stockQuantity ?? 1) <= 0);
}