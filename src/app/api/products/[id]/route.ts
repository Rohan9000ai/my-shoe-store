import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { getProductById, updateProduct, deleteProduct } from "@/services/product.service";

// Public: fetch a single product's full detail (all images, sizes,
// categories) — used by the product detail page.
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: full replace of a product's fields, categories, images, sizes.
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
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await updateProduct(params.id, result.data);
    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: deletes a product.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    await deleteProduct(params.id);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}