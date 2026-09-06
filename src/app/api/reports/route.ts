import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reportQuerySchema } from "@/lib/validations";
import { getReportSummary } from "@/services/report.service";

// Admin-only: returns sales summary (revenue, orders, average order
// value, top product) for a given date range.
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const result = reportQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0]?.message ?? "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    const summary = await getReportSummary(result.data.range, result.data.from, result.data.to);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Get report summary error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}