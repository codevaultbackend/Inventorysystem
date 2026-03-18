"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Item = {
  month: string;
  stockIn: number;
  stockOut: number;
};

type Props = {
  data: Item[];
};

export default function StockMovementChart({ data }: Props) {
  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-5 sm:pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-[15px] font-[600] leading-[22px] text-[#101828] sm:text-[16px] sm:leading-[24px]">
          Stock Movement Trends
        </h3>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-[13px] font-[500] text-[#667085] sm:text-[14px]">
            <span className="h-[8px] w-[8px] rounded-full bg-[#22C55E]" />
            Stock In
          </div>
          <div className="flex items-center gap-2 text-[13px] font-[500] text-[#667085] sm:text-[14px]">
            <span className="h-[8px] w-[8px] rounded-full bg-[#3B82F6]" />
            Stock Out
          </div>
        </div>
      </div>

      <div className="mt-4 h-[240px] w-full sm:h-[280px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#E7EEF7"
              strokeDasharray="3 5"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#667085", fontWeight: 500 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              ticks={[0, 2500, 5000, 7500, 10000]}
              tick={{ fontSize: 11, fill: "#667085", fontWeight: 500 }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #EAECF0",
                boxShadow:
                  "0px 1px 2px rgba(16,24,40,0.04), 0px 4px 10px rgba(16,24,40,0.08)",
                fontSize: "12px",
              }}
            />

            <Line
              type="monotone"
              dataKey="stockIn"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#22C55E", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="stockOut"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#3B82F6", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}