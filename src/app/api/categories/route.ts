import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { listCategories, createCategory, deleteCategory } from "@/services/category.service";

// Public: list all categories — used by the admin page and by the
// storefront's category filters/nav.
export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("List categories error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: creates a new category.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const category = await createCategory(result.data);
    return NextResponse.json({ message: "Category created", category }, { status: 201 });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2002") {
      return NextResponse.json(
        { message: "A category with this name or slug already exists" },
        { status: 409 }
      );
    }
    console.error("Create category error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: deletes a category by id (sent in the request body, since
// there's no separate /[id] route for this simple resource).
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : null;

    if (!id) {
      return NextResponse.json({ message: "Category id is required" }, { status: 400 });
    }

    await deleteCategory(id);
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}