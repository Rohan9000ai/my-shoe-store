import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema, productQuerySchema } from "@/lib/validations";
import { listProducts, createProduct } from "@/services/product.service";

// Public: list products with optional filters (category, search, price
// range) and pagination. Defaults to available-only products.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryResult = productQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!queryResult.success) {
    return NextResponse.json(
      { message: queryResult.error.issues[0]?.message ?? "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    const result = await listProducts(queryResult.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("List products error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: creates a new product.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const product = await createProduct(result.data, session.user.id);
    return NextResponse.json(
      { message: "Product created", productId: product.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}