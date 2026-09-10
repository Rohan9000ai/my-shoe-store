import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateHeroSlide } from "@/services/hero.service";

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
    const slide = await updateHeroSlide(params.id, body);
    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { message: "Failed to update hero slide" },
      { status: 500 }
    );
  }
}