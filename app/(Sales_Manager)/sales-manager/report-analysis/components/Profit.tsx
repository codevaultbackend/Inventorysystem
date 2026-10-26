"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type ProfitItem = {
  month: string;
  profit: number;
};

type Props = {
  data: ProfitItem[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Profit({ data }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
        Monthly Profit Analysis
      </h3>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value: number) => [formatCurrency(Number(value)), "Profit (₹)"]}
            />

            <Bar
              dataKey="profit"
              fill="#6366F1"
              radius={[6, 6, 0, 0]}
              barSize={36}
              name="Profit (₹)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}