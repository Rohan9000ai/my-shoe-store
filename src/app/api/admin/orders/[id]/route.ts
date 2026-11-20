import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusUpdateSchema } from "@/lib/validations";

// Thrown when a cancelled order can't be re-opened because the items are
// no longer in stock.
class ReopenStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReopenStockError";
  }
}

// Admin-only: updates an order's shipment status.
//
// Stock follows the order:
//   - cancelling an order puts its items back in stock;
//   - re-opening a cancelled order takes them out again (and refuses if
//     there isn't enough stock left).
// Without this, every cancelled order would leave its items missing from
// stock forever.
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = orderStatusUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const newStatus = result.data.status;

    const outcome = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: params.id },
          include: { items: true },
        });

        if (!order) return null;

        const wasCancelled = order.status === "cancelled";
        const willBeCancelled = newStatus === "cancelled";
        const stockChanged = wasCancelled !== willBeCancelled;

        if (!wasCancelled && willBeCancelled) {
          for (const item of order.items) {
            await tx.productSize.updateMany({
              where: { productId: item.productId, size: item.size },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        } else if (wasCancelled && !willBeCancelled) {
          for (const item of order.items) {
            const updated = await tx.productSize.updateMany({
              where: {
                productId: item.productId,
                size: item.size,
                stockQuantity: { gte: item.quantity },
              },
              data: { stockQuantity: { decrement: item.quantity } },
            });

            if (updated.count === 0) {
              throw new ReopenStockError(
                `Can't re-open this order: not enough stock for ${item.productName} (size ${item.size}).`
              );
            }
          }
        }

        await tx.order.update({ where: { id: order.id }, data: { status: newStatus } });

        return {
          stockChanged,
          productIds: Array.from(new Set(order.items.map((item) => item.productId))),
        };
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    if (!outcome) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (outcome.stockChanged) {
      revalidatePath("/");
      revalidatePath("/products");
      for (const productId of outcome.productIds) {
        revalidatePath(`/products/${productId}`);
      }
    }

    return NextResponse.json({ message: "Order status updated" });
  } catch (error) {
    if (error instanceof ReopenStockError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("Update order status error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}