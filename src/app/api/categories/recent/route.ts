import { NextResponse } from "next/server";
import { getRecentCategories } from "@/services/category.service";

export async function GET() {
  try {
    const categories = await getRecentCategories(4);
    return NextResponse.json({ categories }, {
      headers: {
        // ✅ Disable caching - always fresh data
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching recent categories:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}