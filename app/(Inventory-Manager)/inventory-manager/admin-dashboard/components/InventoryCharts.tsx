// ================================
// InventoryCharts.tsx
// ================================

"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#FF5A5F",
  "#8B5CF6",
];

export function PurchaseChart({
  data,
}: {
  data: any[];
}) {
  return (
    <div className="h-full overflow-hidden rounded-[28px] border border-[#EAECEF] bg-white p-5 sm:p-7 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)]">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#111827]">
          Purchase Amount Over Time
        </h2>

        <button className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] sm:text-[14px] font-medium text-[#667085]">
          Monthly
        </button>
      </div>

      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 8,
              left: -26,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="purchaseGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#3B82F6"
                  stopOpacity={0.18}
                />

                <stop
                  offset="100%"
                  stopColor="#3B82F6"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#EDF2F7"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={4}
              fill="url(#purchaseGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AgingChart({
  data,
}: {
  data: any[];
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#EAECEF] bg-white p-5 sm:p-7 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)]">

      <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#111827]">
        Stock Status Overview
      </h2>

      <div className="flex-1">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              stroke="none"
            >
              {data.map((_item, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-4 sm:gap-6">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-2"
          >
            <span
              className="h-[12px] w-[12px] rounded-[3px]"
              style={{
                backgroundColor:
                  COLORS[index],
              }}
            />

            <span className="text-[14px] font-medium text-[#475467]">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}