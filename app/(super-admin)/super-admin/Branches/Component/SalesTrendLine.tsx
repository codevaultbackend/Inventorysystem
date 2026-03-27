"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

type SalesTrendPoint = {
  week: string;
  purchase: number;
  sales: number;
};

type Props = {
  data?: SalesTrendPoint[];
};

export function SalesTrendLine({ data = [] }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-[1px_1px_4px_rgba(0,0,0,0.1)] p-6 w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#0F172A]">
            Sales & Purchase Trends
          </h3>
          <p className="text-[12px] text-[#64748B] mt-1">
            Track sales and purchase trends
          </p>
        </div>

        <button className="flex items-center gap-1 text-[13px] text-[#475569] border border-[#E2E8F0] rounded-lg px-3 py-1.5 hover:bg-[#F8FAFC] transition">
          Weekly
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#E2E8F0"
            />
            <XAxis
              dataKey="week"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
              }}
            />

            <Line
              type="monotone"
              dataKey="purchase"
              stroke="#2563EB"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="sales"
              stroke="#EC4899"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}