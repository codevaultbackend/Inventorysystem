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

const data = [
  { day: "Mon", sales: 12000, purchase: 15000 },
  { day: "Tue", sales: 8000, purchase: 12000 },
  { day: "Wed", sales: 45000, purchase: 30000 },
  { day: "Thu", sales: 20000, purchase: 15000 },
  { day: "Fri", sales: 60000, purchase: 45000 },
  { day: "Sat", sales: 42000, purchase: 30000 },
  { day: "Sun", sales: 70000, purchase: 65000 },
];

export default function SalesAnalytics() {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border border-[#EEF2F6]
        shadow-[0_6px_20px_rgba(0,0,0,0.04)]
        p-4 sm:p-6
        w-full
        lg:max-w-[559px]
        min-h-[300px]
        sm:min-h-[320px]
        flex
        flex-col
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#0F172A]">
            Sales Analytics
          </h3>
          <p className="text-[12px] sm:text-[13px] text-[#64748B] mt-1">
            Track sales and purchase trends
          </p>
        </div>

        <button
          className="
            self-start sm:self-auto
            flex items-center gap-1.5
            text-[12px] sm:text-[13px]
            font-medium text-[#475569]
            border border-[#E2E8F0]
            rounded-lg
            px-3 py-1.5
            hover:bg-[#F8FAFC]
            transition
          "
        >
          Weekly
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* ================= CHART ================= */}
      <div className="flex-1 min-h-[200px] sm:min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#E2E8F0"
            />

            <XAxis
              dataKey="day"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
              labelStyle={{
                color: "#0F172A",
                fontWeight: 600,
              }}
            />

            <Line
              type="monotone"
              dataKey="purchase"
              stroke="#6366F1"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />

            <Line
              type="monotone"
              dataKey="sales"
              stroke="#EC4899"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
