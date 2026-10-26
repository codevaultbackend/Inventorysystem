"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type StockItem = {
  value: number;
};

type Props = {
  data: StockItem[];
};

export default function StockStatusOverview({ data }: Props) {
  const chartData = [
    {
      name: "Available",
      value: Number(data?.[0]?.value || 0),
      color: "#3B82F6",
    },
    {
      name: "Damaged",
      value: Number(data?.[1]?.value || 0),
      color: "#FF5A5F",
    },
    {
      name: "Dispatched",
      value: Number(data?.[2]?.value || 0),
      color: "#7C5CFC",
    },
  ];

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  const hasData = total > 0;

  return (
    <div className="flex h-full min-h-[380px] w-full flex-col rounded-[24px] bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-none text-[#111827]">
          Stock Status Overview
        </h2>
      </div>

      {/* Chart Section */}
      <div className="relative flex flex-1 items-center justify-center">
        {hasData ? (
          <div className="h-[260px] w-full max-w-[320px] sm:h-[300px] sm:max-w-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                margin={{
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              >
                <Tooltip
                  formatter={(value: number, _name, item: any) => {
                    const percent = total
                      ? ((value / total) * 100).toFixed(1)
                      : "0.0";

                    return [
                      `${value} (${percent}%)`,
                      item?.payload?.name || "",
                    ];
                  }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #E5E7EB",
                    boxShadow:
                      "0px 10px 30px rgba(15, 23, 42, 0.08)",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: "#FFFFFF",
                  }}
                  cursor={false}
                />

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={4}
                  stroke="none"
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      className="transition-opacity duration-200 hover:opacity-80"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 21L15 15" />
                <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#6B7280]">
                No stock data available
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                Data will appear once inventory is added
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {hasData && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[#F3F4F6] pt-4 sm:flex-nowrap">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2"
            >
              <div
                className="h-[12px] w-[12px] rounded-[4px]"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="whitespace-nowrap text-[13px] font-medium text-[#4B5563]">
                {item.name}

                <span className="ml-1 text-[#9CA3AF]">
                  ({item.value})
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}