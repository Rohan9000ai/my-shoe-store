import Link from "next/link";
import ReportSummary from "@/components/admin/ReportSummary";
import { getReportSummary, type RangeKey } from "@/services/report.service";

const RANGE_TABS: { label: string; value: RangeKey }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const rangeKey = (searchParams.range as RangeKey) ?? "month";

  const {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    topProduct,
    topProductUnits,
    rangeLabel,
  } = await getReportSummary(rangeKey, searchParams.from, searchParams.to);

  const pdfParams = new URLSearchParams({ range: rangeKey });
  if (searchParams.from) pdfParams.set("from", searchParams.from);
  if (searchParams.to) pdfParams.set("to", searchParams.to);
  const pdfHref = `/api/reports/pdf?${pdfParams.toString()}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-espresso">Reports &amp; Analytics</h1>
        <a
          href={pdfHref}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90"
        >
          Download PDF Report
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {RANGE_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reports?range=${tab.value}`}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              rangeKey === tab.value
                ? "bg-espresso text-beige"
                : "bg-white text-brown hover:bg-brown/5"
            }`}
          >
            {tab.label}
          </Link>
        ))}

        <form method="get" className="flex items-center gap-2">
          <input type="hidden" name="range" value="custom" />
          <input
            type="date"
            name="from"
            defaultValue={searchParams.from}
            className="rounded-md border border-brown/20 px-2 py-2 text-sm"
          />
          <span className="text-brown/40">to</span>
          <input
            type="date"
            name="to"
            defaultValue={searchParams.to}
            className="rounded-md border border-brown/20 px-2 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-gold px-3 py-2 text-sm font-semibold text-espresso hover:bg-gold/90"
          >
            Apply
          </button>
        </form>
      </div>

      <p className="mt-2 text-xs text-brown/40">Reporting Period: {rangeLabel}</p>

      <div className="mt-6">
        <ReportSummary
          totalRevenue={totalRevenue}
          totalOrders={totalOrders}
          averageOrderValue={averageOrderValue}
          topProduct={topProduct}
          topProductUnits={topProductUnits}
        />
      </div>
    </div>
  );
}