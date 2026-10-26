"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PendingRejectedStockChartItem = {
  week: string;
  stockIn: number;
  stockOut: number;
};

type Props = {
  data: PendingRejectedStockChartItem[];
};

const GREEN = "#22C55E";
const RED = "#EF4444";

export default function PendingRejectedStockChart({ data }: Props) {
  const safeData = Array.isArray(data) ? data : [];

  const chartData =
    safeData.length > 0
      ? safeData
      : [
       {
  week: "No Data",
  stockIn: 0,
  stockOut: 0,
}
      ];

  return (
    <div className="rounded-[24px] border border-[#D7DFEA] bg-white p-6 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold leading-[28px] text-[#0F172A]">
            Sales & Purchase
          </h2>

        </div>


      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 24, right: 8, left: -18, bottom: 8 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              stroke="#E2E8F0"
              strokeDasharray="4 6"
              vertical={false}
            />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 14 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: "#94A3B8", fontSize: 14 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(148,163,184,0.08)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="square"
              wrapperStyle={{
                paddingTop: 16,
                fontSize: 14,
              }}
              formatter={(value) => (
                <span
                  style={{
                    color: value === "Stock IN" ? GREEN : RED,
                    fontWeight: 600,
                  }}
                >
                  {value}
                </span>
              )}
            />

            <Bar
              dataKey="stockIn"
              name="Stock IN"
              fill={GREEN}
              radius={[8, 8, 0, 0]}
              maxBarSize={46}
            />

            <Bar
              dataKey="stockOut"
              name="Stock OUT"
              fill={RED}
              radius={[8, 8, 0, 0]}
              maxBarSize={46}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}