interface ReportSummaryProps {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProduct: string;
  topProductUnits: number;
}

// Four summary stat cards matching the admin-reports design: Total
// Revenue, Total Orders, Average Order Value, Top Selling Product.
export default function ReportSummary({
  totalRevenue,
  totalOrders,
  averageOrderValue,
  topProduct,
  topProductUnits,
}: ReportSummaryProps) {
  const stats = [
    { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}` },
    { label: "Total Orders", value: totalOrders.toLocaleString() },
    {
      label: "Average Order Value",
      value: `PKR ${Math.round(averageOrderValue).toLocaleString()}`,
    },
    {
      label: "Top Selling Product",
      value: topProduct,
      hint: topProductUnits > 0 ? `${topProductUnits} units claimed` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-brown/10 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brown/50">
            {stat.label}
          </p>
          <p className="mt-2 truncate text-xl font-bold text-espresso" title={stat.value}>
            {stat.value}
          </p>
          {stat.hint && <p className="mt-1 text-xs text-gold">{stat.hint}</p>}
        </div>
      ))}
    </div>
  );
}