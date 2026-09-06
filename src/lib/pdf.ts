import PDFDocument from "pdfkit";
import type { ReportSummary } from "@/services/report.service";

// Builds a sales report PDF as a Buffer using pdfkit. Kept generic to
// just the summary shape so it can be reused wherever a report needs
// exporting, without depending on the API route or page that calls it.
export function generateSalesReportPdf(summary: ReportSummary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(22).fillColor("#3E2723").text("LUXE SOLE", { align: "left" });
    doc.fontSize(11).fillColor("#6B4226").text("Atelier Sales Report", { align: "left" });
    doc.moveDown(1);

    doc.fontSize(10).fillColor("#3E2723");
    doc.text(`Reporting Period: ${summary.rangeLabel}`);
    doc.text(
      `Date Range: ${summary.start.toLocaleDateString("en-US")} - ${summary.end.toLocaleDateString("en-US")}`
    );
    doc.text(`Generated: ${new Date().toLocaleString("en-US")}`);
    doc.moveDown(1.5);

    // Summary section
    doc
      .fontSize(14)
      .fillColor("#3E2723")
      .text("Summary", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#3E2723");
    doc.text(`Total Revenue:        PKR ${summary.totalRevenue.toLocaleString()}`);
    doc.text(`Total Orders:         ${summary.totalOrders}`);
    doc.text(
      `Average Order Value:  PKR ${Math.round(summary.averageOrderValue).toLocaleString()}`
    );
    doc.text(
      `Top Selling Product:  ${summary.topProduct}${
        summary.topProductUnits > 0 ? ` (${summary.topProductUnits} units)` : ""
      }`
    );

    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor("#6B4226")
      .text("Luxe Sole Atelier — Confidential Business Report", { align: "center" });

    doc.end();
  });
}