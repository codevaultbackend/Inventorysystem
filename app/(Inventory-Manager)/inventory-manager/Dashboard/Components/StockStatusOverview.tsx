"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function StockStatusOverview({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const chartData = [
    {
      name: "Available",
      value: Number(data?.[0]?.value || 0),
      color: "#3b82f6",
    },
    {
      name: "Damaged",
      value: Number(data?.[1]?.value || 0),
      color: "#ef4444",
    },
    {
      name: "Repairable",
      value: Number(data?.[2]?.value || 0),
      color: "#8b5cf6",
    },
  ];


  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex h-full w-full flex-col">
      <h2 className="mb-4 text-[15px] font-semibold text-gray-800 sm:mb-5 sm:text-base lg:mb-6 lg:text-lg">
        Stock Status Overview
      </h2>

      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number, _name, item: any) => {
                const percent = total
                  ? ((value / total) * 100).toFixed(1)
                  : 0;

                return [
                  `${value} (${percent}%)`,
                  item?.payload?.name || "",
                ];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
            />

            <Pie
              data={chartData}
              dataKey="value"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600 sm:mt-4 sm:gap-x-6 sm:text-sm">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ background: item.color }}
            />
            <span className="whitespace-nowrap">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}