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
  date: string;
  stockIn?: number;
  stockOut?: number;
}

interface Props {
  title: string;
  subtitle?: string;
  data?: LineChartData[];
  height?: number;
}

export default function StockLineChart({
  title,
  subtitle,
  data = [],
  height = 300,
}: Props) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full bg-white rounded-[18px] border border-[#EEF2F6] shadow-[0px_6px_20px_rgba(17,24,39,0.04)] p-6">
      
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="text-[15px] font-[600] text-[#111827]">
          {title}
        </h3>

        {subtitle && (
          <p className="text-[12px] text-[#9CA3AF] mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* EMPTY */}
      {safeData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={safeData}
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 0,
            }}
          >
            {/* GRID */}
            <CartesianGrid
              stroke="#E5E7EB"
              strokeDasharray="4 4"
              vertical={false}
            />

            {/* X */}
            <XAxis
              dataKey="date"
              tick={{
                fill: "#6B7280",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
            />

            {/* Y */}
            <YAxis
              tick={{
                fill: "#6B7280",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
              width={40}
              domain={["auto", "auto"]}
            />

            {/* TOOLTIP */}
            <Tooltip
              cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #EEF2F6",
                fontSize: 12,
              }}
            />

            {/* STOCK IN */}
            <Line
              type="monotone"
              dataKey="stockIn"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />

            {/* STOCK OUT */}
            <Line
              type="monotone"
              dataKey="stockOut"
              stroke="#60A5FA"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}