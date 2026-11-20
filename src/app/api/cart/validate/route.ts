import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveAvailability } from "@/lib/cart-availability";
import { MAX_CART_LINES } from "@/lib/cart-state";

export const dynamic = "force-dynamic";

const cartCheckSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(100),
        size: z.string().min(1).max(30),
      })
    )
    .max(MAX_CART_LINES),
});

// Public: tells the browser, for every item in its cart, whether it can
// still be bought and what its current name/price/stock are. Read-only —
// it changes nothing. The cart uses this to hide items that are out of
// stock or unavailable, and to bring them back when they return.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = cartCheckSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid cart" }, { status: 400 });
    }

    const { items } = result.data;

    if (items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)));

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        discount: true,
        status: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { imageUrl: true } },
        sizes: { select: { size: true, stockQuantity: true } },
      },
    });

    return NextResponse.json(
      { items: resolveAvailability(items, products) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Cart validation error:", error);
    return NextResponse.json({ message: "Could not check the cart." }, { status: 500 });
  }
}