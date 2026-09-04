import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

// Admin-only: gives the browser a short-lived signature so the Cloudinary
// Upload Widget can upload directly, without ever exposing the API secret.
export async function POST() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "luxe-sole/products";

  // The Upload Widget automatically adds source: "uw" to every upload
  // request, so it must be included here too — Cloudinary rejects the
  // signature as invalid if any sent parameter is missing from it.
  const signature = generateUploadSignature({ timestamp, folder, source: "uw" });

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}