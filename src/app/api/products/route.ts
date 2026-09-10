import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema, productQuerySchema } from "@/lib/validations";
import { listProducts, createProduct } from "@/services/product.service";
import { prisma } from "@/lib/prisma";

// Public: list products with optional filters (category, search, price
// range) and pagination. Defaults to available-only products.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // ✅ Check if this is a request for all products (admin)
  const all = searchParams.get("all") === "true";
  
  // For admin, get all products without filters
  if (all) {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          sizes: true,
        },
      });
      
      return NextResponse.json({ products }, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      });
    } catch (error) {
      console.error("List all products error:", error);
      return NextResponse.json(
        { message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }

  // Regular public request with filters
  const queryResult = productQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!queryResult.success) {
    return NextResponse.json(
      { message: queryResult.error.issues[0]?.message ?? "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    const result = await listProducts(queryResult.data);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
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