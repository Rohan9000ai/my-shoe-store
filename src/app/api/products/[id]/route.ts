import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, productStatusSchema } from "@/lib/validations";
import { getProductById, updateProduct, deleteProduct } from "@/services/product.service";

// Makes status/stock/price changes show on the storefront right away,
// instead of waiting for the once-a-minute refresh.
function refreshStorefront(productId: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

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
    refreshStorefront(params.id);
    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: changes just the availability status (Available /
// Unavailable) without touching anything else on the product.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = productStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { status: result.data.status },
    });

    refreshStorefront(params.id);
    return NextResponse.json({ message: "Status updated" });
  } catch (error) {
    console.error("Update product status error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: deletes a product. A product that appears in past orders
// can't be deleted (the order history must keep pointing at it), so that
// case returns a clear message instead of a generic error.
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
    refreshStorefront(params.id);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "This product is part of existing orders, so it can't be deleted. Set it to Unavailable instead.",
        },
        { status: 409 }
      );
    }

    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}