import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllHeroSlides,
  createHeroSlide,
  deleteHeroSlide,
} from "@/services/hero.service";

// Public: Get all active hero slides
export async function GET() {
  try {
    const slides = await getAllHeroSlides();
    return NextResponse.json({ slides }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { message: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

// Admin: Create a new hero slide
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const slide = await createHeroSlide(body);
    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error("Error creating hero slide:", error);
    return NextResponse.json(
      { message: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}

// Admin: Delete a hero slide
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { message: "Slide ID is required" },
        { status: 400 }
      );
    }
    await deleteHeroSlide(id);
    return NextResponse.json({ message: "Slide deleted" });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { message: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}