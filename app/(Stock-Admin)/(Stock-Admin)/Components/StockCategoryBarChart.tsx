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
}: Props) {

  const safeData = Array.isArray(data) ? data : [];

  return (
    <div
      className="
      bg-white
      rounded-[20px]
      border border-[#EEF2F6]
      shadow-[1px_1px_4px_rgba(0,0,0,0.1)]
      p-4 sm:p-5 lg:p-6
      w-full
      overflow-hidden
    "
    >
      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <h3 className="text-[15px] sm:text-[16px] font-[600] text-[#111827]">
            {title}
          </h3>

          {subtitle && (
            <p className="text-[12px] sm:text-[13px] text-[#6B7280] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* LEGEND */}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] sm:text-[13px] font-[500]">

          <div className="flex items-center gap-1 text-[#2563EB]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            Current
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
            Aging
          </div>

        </div>
      </div>

      {/* ================= CHART ================= */}

      {safeData.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No category data
        </div>
      ) : (
        <div
          className="
          w-full
          overflow-x-auto
        "
        >
          <div
            className="
            min-w-[520px]
            h-[240px]
            sm:h-[280px]
            lg:h-[320px]
          "
          >
            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={safeData}
                barGap={6}
                barCategoryGap="20%"
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
                  interval={0}
                  tickFormatter={(value) =>
                    value.length > 8
                      ? value.slice(0, 8) + "…"
                      : value
                  }
                />

                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />

                <Bar
                  dataKey="current"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                  barSize={8}
                />

                <Bar
                  dataKey="in"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  barSize={8}
                />

                <Bar
                  dataKey="out"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                  barSize={8}
                />

                <Bar
                  dataKey="aging"
                  fill="#EF4444"
                  radius={[6, 6, 0, 0]}
                  barSize={8}
                />

              </BarChart>

            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}