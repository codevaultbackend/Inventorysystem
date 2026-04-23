"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { formatNumber } from "@/app/lib/salesDashboardApi";

type TrendPoint = {
  week: string;
  stockIn: number;
  stockOut: number;
};

type Props = {
  title?: string;
  subtitle?: string;
  data?: TrendPoint[];
  firstLegend?: string;
  secondLegend?: string;
};

export function StockTrendBar({
  title = "Pending & Rejected Quation",
  subtitle = "Track sales and purchase trends",
  data = [],
  firstLegend = "Stock IN",
  secondLegend = "Stock OUT",
}: Props) {
  return (
    <div className="rounded-[24px] border border-[#E6ECF2] bg-white p-5 shadow-[1px_1px_4px_rgba(0,0,0,0.1)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-semibold text-[#111827]">{title}</h3>
          <p className="mt-1 text-[12px] text-[#98A2B3]">{subtitle}</p>
        </div>

        <button className="inline-flex items-center gap-1 rounded-lg px-1 py-1 text-[13px] font-medium text-[#6B7280]">
          Weekly
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[260px] w-full sm:h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={28}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E8EEF5" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8A94A6", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatNumber(Number(value))}
              tick={{ fill: "#8A94A6", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => formatNumber(Number(value))}
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E5EAF0",
                borderRadius: "14px",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
              }}
            />
            <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="stockIn" name={firstLegend} fill="#28D146" radius={[6, 6, 0, 0]} />
            <Bar dataKey="stockOut" name={secondLegend} fill="#F04444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}