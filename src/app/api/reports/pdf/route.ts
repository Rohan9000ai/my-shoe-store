import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reportQuerySchema } from "@/lib/validations";
import { getReportSummary, type RangeKey } from "@/services/report.service";
import { generateSalesReportPdf } from "@/lib/pdf";

// Admin-only: generates and downloads a PDF sales report for a given
// date range, using the same report.service data as the on-screen page.
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
    const summary = await getReportSummary(
      result.data.range as RangeKey,
      result.data.from,
      result.data.to
    );

    const pdfBuffer = await generateSalesReportPdf(summary);
    const fileName = `luxe-sole-sales-report-${result.data.range}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Generate report PDF error:", error);
    return NextResponse.json(
      { message: "Something went wrong generating the PDF. Please try again." },
      { status: 500 }
    );
  }
}