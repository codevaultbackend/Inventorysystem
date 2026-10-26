"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type TransitChartItem = {
  name: string;
  value: number;
  percentage: number;
};

type Props = {
  data?: TransitChartItem[];
  loading?: boolean;
};

const COLORS = ["#2563EB", "#F97316", "#06B6D4", "#84CC16", "#EC4899", "#8B5CF6"];

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

export default function TransitDonutChart({
  data = [],
  loading = false,
}: Props) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: getColor(index),
  }));

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A]">
        Transit Goods
      </h3>
      <p className="mb-4 text-[12px] text-[#64748B]">
        Goods currently out for delivery
      </p>

      {loading ? (
        <div className="h-[260px] animate-pulse rounded-2xl bg-[#F8FAFC] sm:h-[280px]" />
      ) : chartData.length > 0 ? (
        <div className="flex flex-col gap-5 lg:h-[280px] lg:flex-row lg:items-center">
          <div className="h-[180px] w-full sm:h-[220px] lg:h-[220px] lg:w-[48%]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={56}
                  outerRadius={86}
                  paddingAngle={5}
                  cornerRadius={16}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-3 lg:w-[52%]">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#0F172A]">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">
                      {item.value.toLocaleString("en-IN")} units
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-[13px] font-semibold text-[#0F172A]">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[260px] items-center justify-center rounded-2xl bg-[#F8FAFC] text-sm text-[#64748B] sm:h-[280px]">
          No transit goods data found
        </div>
      )}
    </div>
  );
}