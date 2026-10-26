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
import { useEffect, useState } from "react";

interface StateStock {
  state: string;
  stock: number;
}

interface Props {
  title: string;
  subtitle?: string;
  data: StateStock[];
  height?: number;
}

export default function StockDistributionByStateChart({
  title,
  subtitle,
  data,
  height = 320,
}: Props) {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const chartHeight = isMobile ? 240 : height;

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

        <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#111827]">
          {title}
        </h3>

        {subtitle && (
          <p className="text-[12px] sm:text-[13px] text-[#9CA3AF] mt-1">
            {subtitle}
          </p>
        )}

      </div>

      {/* CHART */}

      <div className="w-full overflow-x-auto">

        <div
          style={{
            width: "100%",
            height: chartHeight,
            minWidth: isMobile ? 420 : "100%",
          }}
        >

          <ResponsiveContainer width="100%" height="100%">

            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >

              {/* GRID */}

              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                vertical={false}
              />

              {/* X AXIS */}

              <XAxis
                dataKey="state"
                tick={{
                  fill: "#6B7280",
                  fontSize: isMobile ? 11 : 12,
                }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={(value: string) =>
                  value.length > 8 ? value.slice(0, 8) + "…" : value
                }
              />

              {/* Y AXIS */}

              <YAxis
                tick={{
                  fill: "#6B7280",
                  fontSize: isMobile ? 11 : 12,
                }}
                axisLine={false}
                tickLine={false}
                width={isMobile ? 28 : 35}
              />

              {/* TOOLTIP */}

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />

              {/* BAR */}

              <Bar
                dataKey="stock"
                fill="#2563EB"
                radius={[8, 8, 0, 0]}
                barSize={isMobile ? 20 : 36}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}