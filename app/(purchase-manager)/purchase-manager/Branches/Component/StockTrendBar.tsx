"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
  { week: "Week 1", in: 700, out: 400 },
  { week: "Week 2", in: 1000, out: 1000 },
  { week: "Week 3", in: 1000, out: 1000 },
  { week: "Week 4", in: 1000, out: 1000 },
];

export function StockTrendBar() {
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-[0_6px_20px_rgba(0,0,0,0.04)] p-6 w-full">
      
      {/* Header */}
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

      {/* Chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
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
            <Bar dataKey="in" fill="#22C55E" radius={[6, 6, 0, 0]} />
            <Bar dataKey="out" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
