import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ReportSummary } from "@/services/report.service";

// Change this if the store name changes.
const STORE_NAME = "ZTS Collections";

const ESPRESSO = rgb(0.243, 0.153, 0.137);
const BROWN = rgb(0.42, 0.259, 0.149);
const GOLD = rgb(0.788, 0.635, 0.153);

// Standard PDF fonts only cover Latin characters. Replace anything else
// (for example Urdu product names) so drawing text can never throw.
function safe(text: string): string {
  return text.replace(
    /[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022]/g,
    "?"
  );
}

function clip(text: string, max = 60): string {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

// Builds the sales report PDF. pdf-lib is pure JavaScript, so it runs on
// Vercel without needing any font files on disk.
export async function generateSalesReportPdf(summary: ReportSummary): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const left = 50;
  let y = 790;

  page.drawText(safe(STORE_NAME.toUpperCase()), {
    x: left,
    y,
    size: 22,
    font: bold,
    color: ESPRESSO,
  });
  y -= 20;
  page.drawText("Atelier Sales Report", { x: left, y, size: 11, font: regular, color: BROWN });
  y -= 14;
  page.drawRectangle({ x: left, y, width: 495, height: 2, color: GOLD });
  y -= 28;

  const meta = [
    `Reporting Period: ${summary.rangeLabel}`,
    `Date Range: ${summary.start.toLocaleDateString("en-US")} - ${summary.end.toLocaleDateString("en-US")}`,
    `Generated: ${new Date().toLocaleString("en-US")}`,
  ];
  for (const line of meta) {
    page.drawText(safe(line), { x: left, y, size: 10, font: regular, color: ESPRESSO });
    y -= 15;
  }
  y -= 15;

  page.drawText("Summary", { x: left, y, size: 14, font: bold, color: ESPRESSO });
  y -= 24;

  const rows: [string, string][] = [
    ["Total Revenue", `PKR ${summary.totalRevenue.toLocaleString("en-US")}`],
    ["Total Orders", String(summary.totalOrders)],
    [
      "Average Order Value",
      `PKR ${Math.round(summary.averageOrderValue).toLocaleString("en-US")}`,
    ],
    [
      "Top Selling Product",
      summary.topProductUnits > 0
        ? `${summary.topProduct} (${summary.topProductUnits} units)`
        : summary.topProduct,
    ],
  ];

  for (const [label, value] of rows) {
    page.drawText(safe(label), { x: left, y, size: 11, font: bold, color: ESPRESSO });
    page.drawText(safe(clip(value)), { x: left + 170, y, size: 11, font: regular, color: ESPRESSO });
    y -= 22;
  }

  page.drawText(safe(`${STORE_NAME} - Confidential Business Report`), {
    x: left,
    y: 40,
    size: 8,
    font: regular,
    color: BROWN,
  });

  return pdfDoc.save();
}