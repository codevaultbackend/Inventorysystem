"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

type Item = {
  month: string;
  actual: number;
  budget: number;
};

type Props = {
  data: Item[];
};

export default function MonthlySpendBudgetChart({ data }: Props) {
  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-5 sm:pb-5">
      <h3 className="text-[15px] font-[600] leading-[22px] text-[#101828] sm:text-[16px] sm:leading-[24px]">
        Monthly Spend vs Budget
      </h3>

      <div className="mt-4 h-[240px] w-full sm:h-[280px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.12} />
              </linearGradient>
            </defs>

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
              domain={[0, 2]}
              ticks={[0, 0.5, 1, 1.5, 2]}
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

            <ReferenceLine x="Nov" stroke="#D0D5DD" strokeWidth={1} />

            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fill="url(#spendFill)"
              activeDot={{
                r: 6,
                fill: "#BFD4FF",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}