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
  in: number;
  out: number;
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
            in: 0,
            out: 0,
          },
        ];

  return (
    <div className="rounded-[24px] border border-[#D7DFEA] bg-white p-6 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold leading-[28px] text-[#0F172A]">
            Pending & Rejected Quatation
          </h2>
          <p className="mt-1 text-[14px] font-medium text-[#94A3B8]">
            Track sales and purchase trends
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 text-[16px] font-medium text-[#64748B]"
        >
          Weekly
          <span className="text-[14px]">⌄</span>
        </button>
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
              formatter={(value) => {
                if (value === "in") return "Stock IN";
                if (value === "out") return "Stock OUT";
                return value;
              }}
            />

            <Bar
              dataKey="in"
              name="in"
              radius={[8, 8, 0, 0]}
              maxBarSize={46}
              minPointSize={safeData.length ? 6 : 0}
            >
              {chartData.map((_, index) => (
                <Cell key={`in-${index}`} fill={GREEN} />
              ))}
            </Bar>

            <Bar
              dataKey="out"
              name="out"
              radius={[8, 8, 0, 0]}
              maxBarSize={46}
              minPointSize={safeData.length ? 6 : 0}
            >
              {chartData.map((_, index) => (
                <Cell key={`out-${index}`} fill={RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}