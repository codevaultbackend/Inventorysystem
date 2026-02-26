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

interface LineChartData {
  [key: string]: string | number;
}

interface StockLineChartProps {
  title: string;
  subtitle?: string;
  data: LineChartData[];
  xKey: string;
  yKey: string;
  lineColor?: string;
  height?: number;
  showDropdowns?: boolean;
}

export default function StockLineChart({
  title,
  subtitle,
  data,
  xKey,
  yKey,
  lineColor = "#2563EB",
  height = 280,
  showDropdowns = false,
}: StockLineChartProps) {
  return (
    <div
      className="
        bg-white
        rounded-[18px]
        border border-[#EEF2F6]
        shadow-[0px_6px_20px_rgba(17,24,39,0.04)]
        p-6
        transition-all
        hover:shadow-[0px_10px_28px_rgba(17,24,39,0.06)]
        w-full
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-[600] text-[#111827]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[13px] text-[#6B7280] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {showDropdowns && (
          <div className="flex gap-2">
            <select className="text-[13px] border border-[#E5E7EB] rounded-[10px] px-3 py-1 text-[#374151]">
              <option>All Categories</option>
            </select>
            <select className="text-[13px] border border-[#E5E7EB] rounded-[10px] px-3 py-1 text-[#374151]">
              <option>All Warehouses</option>
            </select>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
          />

          <XAxis
            dataKey={xKey}
            stroke="#9CA3AF"
            fontSize={12}
          />

          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              boxShadow:
                "0px 6px 18px rgba(17,24,39,0.08)",
            }}
          />

          <Line
            type="monotone"
            dataKey={yKey}
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}