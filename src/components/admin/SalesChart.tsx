"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SalesChartPoint {
  label: string; // e.g. "Sep 3"
  total: number; // revenue that day
}

// Simple line chart of daily revenue over the recent period, replacing
// the earlier "Sales trajectory chart placeholder" text.
export default function SalesChart({ data }: { data: SalesChartPoint[] }) {
  const hasSales = data.some((point) => point.total > 0);

  if (!hasSales) {
    return (
      <p className="mt-4 text-sm text-brown/40">
        No sales yet in this period — the chart will fill in as orders come through.
      </p>
    );
  }

  return (
    <div className="mt-4 h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#6B422620" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6B4226" }}
            axisLine={{ stroke: "#6B422640" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B4226" }}
            axisLine={false}
            tickLine={false}
            width={45}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            // ✅ FIXED: Removed the type annotation
            formatter={(value) => {
              if (typeof value === 'number') {
                return [`PKR ${value.toLocaleString()}`, "Revenue"];
              }
              return [value, "Revenue"];
            }}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #6B422620",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#C9A227"
            strokeWidth={2}
            dot={{ r: 3, fill: "#C9A227" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}