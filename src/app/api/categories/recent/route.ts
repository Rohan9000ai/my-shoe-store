import { NextResponse } from "next/server";
import { getRecentCategories } from "@/services/category.service";

export async function GET() {
  try {
    const categories = await getRecentCategories(4);
    return NextResponse.json({ categories }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
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