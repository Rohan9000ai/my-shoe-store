import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

// Admin-only: creates a new product with its categories, images, and sizes
// in one go.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, description, price, discount, status, categoryIds, images, sizes } =
      result.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        discount: discount ?? null,
        status,
        createdBy: session.user.id,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        images: {
          create: images.map((img, index) => ({
            imageUrl: img.imageUrl,
            altText: img.altText || null,
            position: img.position ?? index,
          })),
        },
        sizes: {
          create: sizes.map((size) => ({
            size: size.size,
            stockQuantity: size.stockQuantity,
            sku: size.sku || null,
          })),
        },
      },
    });

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