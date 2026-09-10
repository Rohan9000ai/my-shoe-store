import { NextResponse } from "next/server";
import { getAllCategories } from "@/services/category.service";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories }, {
      headers: {
        // ✅ Disable caching - always fresh data
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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