import type { ItemAvailability } from "@/types/cart";

interface ProductForCart {
  id: string;
  name: string;
  price: unknown; // Prisma Decimal
  discount: unknown; // Prisma Decimal | null
  status: string;
  images: { imageUrl: string }[];
  sizes: { size: string; stockQuantity: number }[];
}

// Decides, for each cart line, whether it can be bought right now:
//   unavailable  — the product was deleted or the admin set it Unavailable
//   out_of_stock — that size has 0 left (or the size no longer exists)
//   available    — at least 1 left
export function resolveAvailability(
  lines: { productId: string; size: string }[],
  products: ProductForCart[]
): ItemAvailability[] {
  const byId = new Map(products.map((product) => [product.id, product]));

  return lines.map(({ productId, size }): ItemAvailability => {
    const product = byId.get(productId);

    if (!product || product.status !== "available") {
      return {
        productId,
        size,
        state: "unavailable",
        stock: 0,
        name: product?.name ?? "",
        price: Number(product?.price ?? 0),
        discount: product?.discount ? Number(product.discount) : 0,
        imageUrl: product?.images[0]?.imageUrl ?? null,
      };
    }

    const stock = Math.max(0, product.sizes.find((s) => s.size === size)?.stockQuantity ?? 0);

    return {
      productId,
      size,
      state: stock > 0 ? "available" : "out_of_stock",
      stock,
      name: product.name,
      price: Number(product.price),
      discount: product.discount ? Number(product.discount) : 0,
      imageUrl: product.images[0]?.imageUrl ?? null,
    };
  });
}