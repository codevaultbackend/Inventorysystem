"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

type AgingData = {
  name: string;
  value: number;
  color: string;
};

interface Props {
  data?: AgingData[];
}

export default function AgingDistributionPie({ data }: Props) {

  /* ================= DEFAULT DATA ================= */

  const defaultData: AgingData[] = [
    { name: "0-180", value: 27, color: "#FF5A1F" },
    { name: "181-365", value: 15, color: "#38BDF8" },
    { name: "366-730", value: 11, color: "#DB2777" },
    { name: "731-1200", value: 8, color: "#84CC16" },
    { name: "730+", value: 47, color: "#2563EB" },
  ];

  const chartData = data && data.length ? data : defaultData;

  const total = chartData.reduce((a, b) => a + b.value, 0);

  const RADIAN = Math.PI / 180;

  /* ================= MOBILE DETECTION ================= */

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ================= DESKTOP LABEL ================= */

  const renderDesktopLabel = (props: any) => {

    const { cx, cy, midAngle, outerRadius, payload } = props;

    const radius = outerRadius + 30;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const percent =
      total === 0
        ? 0
        : ((payload.value / total) * 100).toFixed(0);

    const isRight = x > cx;

    return (
      <g>

        <line
          x1={cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)}
          y1={cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)}
          x2={x}
          y2={y}
          stroke="#D1D5DB"
          strokeDasharray="3 3"
        />

        <text
          x={x + (isRight ? 6 : -6)}
          y={y}
          textAnchor={isRight ? "start" : "end"}
          dominantBaseline="central"
          fontSize={13}
          fontWeight={600}
          fill={payload.color}
        >
          {payload.name}: {percent}%
        </text>

      </g>
    );
  };

  /* ================= MOBILE LABEL ================= */

  const renderMobileLabel = (props: any) => {

    const { cx, cy, midAngle, outerRadius, payload } = props;

    const radius = outerRadius + 10;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const percent =
      total === 0
        ? 0
        : ((payload.value / total) * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill={payload.color}
      >
        {percent}%
      </text>
    );
  };

  return (
    <div
      className="
      bg-white
      rounded-[20px]
      border border-[#EEF2F6]
      shadow-[0px_6px_20px_rgba(17,24,39,0.05)]
      p-4 sm:p-6
      w-full
    "
    >

      {/* HEADER */}

      <div className="mb-4 sm:mb-6">

        <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#111827]">
          Aging Distribution
        </h3>

        <p className="text-[12px] sm:text-[14px] text-[#9CA3AF]">
          Stock breakdown by age groups
        </p>

      </div>

      {/* CHART */}

      <div
        className="
        w-full
        aspect-square
        max-h-[260px]
        sm:max-h-[340px]
      "
      >

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? "50%" : "55%"}
              outerRadius={isMobile ? "70%" : "80%"}
              paddingAngle={6}
              cornerRadius={12}
              label={isMobile ? renderMobileLabel : renderDesktopLabel}
              labelLine={false}
              stroke="#FFFFFF"
              strokeWidth={4}
            >

              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}

            </Pie>

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}