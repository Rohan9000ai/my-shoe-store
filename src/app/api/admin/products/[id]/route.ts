import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

// Admin-only: replaces a product's categories/images/sizes and updates its
// core fields. Existing related rows are cleared and recreated in one
// transaction, since these are set-style fields the form fully replaces.
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
      const firstIssue = result.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, description, price, discount, status, categoryIds, images, sizes } =
      result.data;

    await prisma.$transaction([
      prisma.productCategory.deleteMany({ where: { productId: params.id } }),
      prisma.productImage.deleteMany({ where: { productId: params.id } }),
      prisma.productSize.deleteMany({ where: { productId: params.id } }),
      prisma.product.update({
        where: { id: params.id },
        data: {
          name,
          description,
          price,
          discount: discount ?? null,
          status,
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
      }),
    ]);

    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: deletes a product. Cascade delete on the schema removes its
// images, sizes, and category links automatically.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}