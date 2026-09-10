import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHeroSettings, updateHeroSettings } from "@/services/hero.service";

// Public: Get hero settings
export async function GET() {
  try {
    const settings = await getHeroSettings();
    return NextResponse.json({ settings }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Error fetching hero settings:", error);
    return NextResponse.json(
      { message: "Failed to fetch hero settings" },
      { status: 500 }
    );
  }
}

// Admin: Update hero settings
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const settings = await updateHeroSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating hero settings:", error);
    return NextResponse.json(
      { message: "Failed to update hero settings" },
      { status: 500 }
    );
  }
}