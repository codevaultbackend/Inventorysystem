"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type StockDistributionItem = {
  name: string;
  value: number;
  total: number;
  color: string;
};

type Props = {
  data?: StockDistributionItem[];
  loading?: boolean;
};

function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, value, fill, percent } = props;

  const numericValue = Number(value) || 0;
  const numericPercent = Number(percent) || 0;

  if (numericValue <= 0 || numericPercent < 0.07) return null;

  const RADIAN = Math.PI / 180;
  const angle = -midAngle * RADIAN;
  const isRight = Math.cos(angle) >= 0;

  const startX = cx + (outerRadius - 3) * Math.cos(angle);
  const startY = cy + (outerRadius - 3) * Math.sin(angle);

  const midX = cx + (outerRadius + 10) * Math.cos(angle);
  const midY = cy + (outerRadius + 10) * Math.sin(angle);

  const endX = isRight ? midX + 24 : midX - 24;
  const endY = midY;

  return (
    <g>
      <line
        x1={startX}
        y1={startY}
        x2={midX}
        y2={midY}
        stroke="#D5DCE5"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <line
        x1={midX}
        y1={midY}
        x2={endX}
        y2={endY}
        stroke="#D5DCE5"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <text
        x={isRight ? endX + 6 : endX - 6}
        y={endY + 4}
        fill={fill}
        textAnchor={isRight ? "start" : "end"}
        fontSize="12"
        fontWeight="700"
      >
        {`${Math.round(numericValue)}%`}
      </text>
    </g>
  );
}

export default function StockDistribution({
  data = [],
  loading = false,
}: Props) {
  const normalizedData = useMemo(() => {
    return data.map((item, index) => ({
      name: item?.name || `Category ${index + 1}`,
      value: Number(item?.value || 0),
      total: Number(item?.total || 0),
      color: item?.color || "#2563EB",
    }));
  }, [data]);

  const chartData = useMemo(() => {
    return normalizedData.filter((item) => item.value > 0);
  }, [normalizedData]);

  const hasChartData = chartData.length > 0;

  return (
    <section className="min-w-0 rounded-[20px] border border-[#E8EDF3] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.08),0_1px_2px_rgba(16,24,40,0.04)] sm:px-6 sm:py-5 xl:h-[280px]">
      <div className="mb-3">
        <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#171717]">
          Stock Distribution
        </h3>
        <p className="mt-1 text-[13px] leading-[18px] text-[#9AA0AA]">
          Category-wise Breakdown
        </p>
      </div>

      {loading ? (
        <div className="mt-3 h-[190px] animate-pulse rounded-[16px] bg-[#F7FAFC]" />
      ) : hasChartData ? (
        <div className="mt-2 grid min-h-[190px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-center">
          <div className="flex min-h-[190px] items-center justify-center overflow-visible">
            <div className="flex h-[190px] w-full max-w-[260px] items-center justify-center overflow-visible sm:h-[205px] sm:max-w-[290px] md:max-w-[320px] xl:h-[185px] xl:max-w-[250px] 2xl:max-w-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 28, bottom: 20, left: 28 }}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="76%"
                    paddingAngle={8}
                    cornerRadius={18}
                    startAngle={120}
                    endAngle={-240}
                    stroke="none"
                    labelLine={false}
                    label={renderCustomLabel}
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full self-center lg:max-w-[190px]">
            <div className="max-h-[172px] space-y-3 overflow-y-auto pr-1">
              {normalizedData.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-[10px] w-[10px] shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-[14px] font-medium text-[#2A2A2A]">
                      {item.name}
                    </span>
                  </div>

                  <span className="shrink-0 text-[14px] font-semibold text-[#171717]">
                    {Math.round(item.value)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex h-[190px] items-center justify-center rounded-[16px] border border-dashed border-[#E5EAF1] bg-[#FAFCFE] text-sm text-[#8A94A6]">
          No stock distribution data found
        </div>
      )}
    </section>
  );
}