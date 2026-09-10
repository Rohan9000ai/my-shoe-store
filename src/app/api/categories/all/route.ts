import { NextResponse } from "next/server";
import { getAllCategories } from "@/services/category.service";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}