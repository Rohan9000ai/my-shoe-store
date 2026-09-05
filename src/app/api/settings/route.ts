import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingSchema } from "@/lib/validations";

// Public: returns store settings needed by the storefront (delivery
// charge, free delivery threshold, tax rate, WhatsApp number), with
// sensible defaults for any key not yet configured by the admin.
export async function GET() {
  try {
    const rows = await prisma.settings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      settingsMap[row.key] = row.value;
    }

    return NextResponse.json({
      deliveryCharge: Number(settingsMap.delivery_charge ?? 1500),
      freeDeliveryThreshold: Number(settingsMap.free_delivery_threshold ?? 50000),
      taxRate: Number(settingsMap.tax_rate ?? 0),
      whatsappNumber:
        settingsMap.whatsapp_number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
      raw: settingsMap,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only: creates or updates a single setting (upsert by key).
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = settingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { key, value } = result.data;

    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ message: "Setting saved" });
  } catch (error) {
    console.error("Save setting error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}