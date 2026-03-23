"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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
  const { cx, cy, midAngle, outerRadius, value, fill } = props;

  const RADIAN = Math.PI / 180;
  const angle = -midAngle * RADIAN;
  const isRight = Math.cos(angle) >= 0;

  const startX = cx + (outerRadius - 6) * Math.cos(angle);
  const startY = cy + (outerRadius - 6) * Math.sin(angle);

  const midX = cx + (outerRadius + 22) * Math.cos(angle);
  const midY = cy + (outerRadius + 22) * Math.sin(angle);

  const endX = isRight ? midX + 62 : midX - 62;
  const endY = midY;

  const textX = isRight ? endX + 8 : endX - 8;

  return (
    <g>
      <line
        x1={startX}
        y1={startY}
        x2={midX}
        y2={midY}
        stroke="#D1D5DB"
        strokeWidth={2}
        strokeDasharray="3 3"
      />
      <line
        x1={midX}
        y1={midY}
        x2={endX}
        y2={endY}
        stroke="#D1D5DB"
        strokeWidth={2}
        strokeDasharray="3 3"
      />
      <text
        x={textX}
        y={endY + 5}
        fill={fill}
        textAnchor={isRight ? "start" : "end"}
        fontSize="13"
        fontWeight="700"
      >
        {`${Number(value).toFixed(0)}%`}
      </text>
    </g>
  );
}

export default function StockDistribution({
  data = [],
  loading = false,
}: Props) {
  return (
    <div className=" lg:max-h-[320px] max-h-[520px] h-full min-w-0 overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white px-4 py-4 shadow-[1px_1px_4px_rgba(0,0,0,0.1)] sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="">
        <h3 className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-[#111827] sm:text-[20px] lg:text-[22px]">
          Stock Distribution
        </h3>
        <p className="mt-1.5 text-[12px] text-[#9CA3AF] sm:text-[13px] lg:text-[14px]">
          Category-wise Breakdown
        </p>
      </div>

      {loading ? (
        <div className=" rounded-[20px] bg-[#F8FAFC] sm:h-[360px] xl:h-[200px]" />
      ) : data.length > 0 ? (
        <div className="flex h-full min-h-[270px] min-w-0 flex-col gap-6 sm:min-h-[270px] xl:min-h-[210px] xl:flex-row xl:items-center xl:gap-4">
          <div className="flex min-w-0 flex-1 items-center justify-center xl:basis-[38%]">
            <div className="h-[220px] w-full max-w-[320px] max-w-[650px]:w-[350px];
    max-w-[650px]:h-[135px] max-w-[650px]:left-[-15px] sm:h-[240px] sm:max-w-[360px] md:h-[240px] md:max-w-[390px] xl:h-[240px] xl:max-w-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 26, bottom: 10, left: 26 }}>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="42%"
                    outerRadius="68%"
                    paddingAngle={8}
                    cornerRadius={16}
                    startAngle={110}
                    endAngle={-250}
                    stroke="none"
                    labelLine={false}
                    label={renderCustomLabel}
                    isAnimationActive={false}
                  >
                    {data.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="min-w-0 xl:basis-[32%]">
            <div className="space-y-1 sm:space-y-1">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex min-w-0 items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-[11px] w-[11px] shrink-0 rounded-full sm:h-[12px] sm:w-[12px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-[15px] font-medium text-[#1F2937] sm:text-[16px] lg:text-[17px]">
                      {item.name}
                    </span>
                  </div>

                  <span className="shrink-0 text-[15px] font-semibold text-[#111827] sm:text-[16px] lg:text-[17px]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-[20px] bg-[#F8FAFC] text-sm text-[#64748B] sm:h-[360px] xl:h-[400px]">
          No stock distribution data found
        </div>
      )}
    </div>
  );
}