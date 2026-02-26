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

interface BarConfig {
  key: string;
  label: string;
  color: string;
}

interface StockCategoryBarChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  bars: BarConfig[];
  height?: number;
}

export default function StockCategoryBarChart({
  title,
  subtitle,
  data,
  bars,
  height = 350,
}: StockCategoryBarChartProps) {
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
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={6}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
          />

          <XAxis
            dataKey="category"
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

          <Legend
            wrapperStyle={{
              fontSize: "13px",
              color: "#374151",
            }}
          />

          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color}
              radius={[6, 6, 0, 0]}
              barSize={18}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}