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

interface StockCategoryItem {
  name: string;
  current: number;
  in: number;
  out: number;
  aging: number;
}

interface Props {
  title: string;
  subtitle?: string;
  data?: StockCategoryItem[];
  height?: number;
}

export default function StockCategoryBarChart({
  title,
  subtitle,
  data = [],
  height = 320,
}: Props) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div
      className="
      bg-white
      rounded-[18px]
      border border-[#EEF2F6]
      shadow-[0_6px_20px_rgba(17,24,39,0.04)]
      p-6
      w-full
    "
    >
      {/* ================= HEADER ================= */}

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

        {/* ===== LEGEND ===== */}

        <div className="flex gap-4 text-[13px] font-[500]">

          <div className="flex items-center gap-1 text-[#2563EB]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            Current Stock
          </div>

          <div className="flex items-center gap-1 text-[#10B981]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            Stock IN
          </div>

          <div className="flex items-center gap-1 text-[#F59E0B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            Stock OUT
          </div>

          <div className="flex items-center gap-1 text-[#EF4444]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            Stock Aging
          </div>

        </div>

      </div>

      {/* ================= CHART ================= */}

      {safeData.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No category data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={safeData}
            barGap={6}
            barCategoryGap={18}
          >
            <CartesianGrid
              stroke="#E5E7EB"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
              }}
            />

            <Bar
              dataKey="current"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

            <Bar
              dataKey="in"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

            <Bar
              dataKey="out"
              fill="#F59E0B"
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

            <Bar
              dataKey="aging"
              fill="#EF4444"
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}