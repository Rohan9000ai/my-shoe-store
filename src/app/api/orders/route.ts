import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { orderSchema } from "@/lib/validations";
import { createOrder, InsufficientStockError } from "@/services/order.service";

// Places an order. Works for both logged-in customers and guests
// (userId is nullable) — session is optional, matching the project's
// guest-checkout requirement.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  try {
    const body = await request.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { items, shipping, paymentMethod } = result.data;

    const order = await createOrder({
      items,
      shipping,
      paymentMethod,
      userId: session?.user?.id ?? null,
    });

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderNumber: order.orderNumber,
        orderId: order.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("Place order error:", error);
    return NextResponse.json(
      { message: "Something went wrong while placing your order. Please try again." },
      { status: 500 }
    );
  }
}