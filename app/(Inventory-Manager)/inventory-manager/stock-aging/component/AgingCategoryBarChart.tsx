"use client";

import { memo, useMemo } from "react";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type Item = {
  name: string;
  blue: number;
  green: number;
  yellow: number;
  red: number;
};

type Props = {
  data: Item[];
};

function AgingCategoryBarChart({
  data = [],
}: Props) {
  /**
   * EXACT FIGMA DATA STRUCTURE
   * + production safe
   */
  const processedData = useMemo(() => {
    return data
      .filter(
        (item) =>
          item &&
          item.name
      )
      .map((item) => {
        const fullName =
          item.name.trim();

        return {
          fullName,

          shortName:
            fullName.length > 12
              ? `${fullName.slice(
                  0,
                  12
                )}...`
              : fullName,

          average: Number(
            item.blue || 0
          ),

          good: Number(
            item.green || 0
          ),

          repairable: Number(
            item.yellow || 0
          ),

          damaged: Number(
            item.red || 0
          ),
        };
      });
  }, [data]);

  /**
   * SAFE MAX VALUE
   */
  const maxValue = useMemo(() => {
    return Math.max(
      ...processedData.flatMap(
        (item) => [
          item.average,
          item.good,
          item.repairable,
          item.damaged,
        ]
      ),
      10
    );
  }, [processedData]);

  /**
   * EXACT FIGMA WIDTH BEHAVIOUR
   */
  const dynamicWidth =
    processedData.length <= 5
      ? "100%"
      : `${processedData.length * 82}px`;

  /**
   * EMPTY STATE
   */
  if (!processedData.length) {
    return (
      <div
        className="
          flex
          h-full
          min-h-[265px]
          items-center
          justify-center

          rounded-[28px]
          border
          border-[#EAECF0]
          bg-white
          p-5

          shadow-[1px_1px_4px_0px_#0000001A]
        "
      >
        <p
          className="
            text-[14px]
            font-[500]
            text-[#98A2B3]
          "
        >
          No category data available
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-[28px]
        border
        border-[#EAECF0]
        bg-white
        p-5

        shadow-[1px_1px_4px_0px_#0000001A]
      "
    >
      {/* HEADER */}
      <div>
        <h3
          className="
            text-[14px]
            font-[500]
            leading-[100%]
            tracking-[0%]
            text-[#000000]
          "
        >
          Aging by Category
        </h3>

        <p
          className="
            mt-1
            text-[11px]
            font-[400]
            text-[#99A1AF]
            leading-[20px]
          "
        >
          Track sales and purchase
          trends
        </p>
      </div>

      {/* CHART */}
      <div
        className="
          mt-4
          h-[90%]
          w-full
          overflow-x-auto
          overflow-y-hidden

          scrollbar-thin
          scrollbar-thumb-[#D0D5DD]
          scrollbar-track-transparent
        "
      >
        <div
          style={{
            width: dynamicWidth,
            minWidth: "100%",
            height: "100%",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={processedData}
              margin={{
                top: 10,
                right: 6,
                left: 8,
                bottom: 0,
              }}
              barGap={3}
              barCategoryGap="20%"
            >
              {/* GRID */}
              <CartesianGrid
                vertical={false}
                stroke="#EEF2F6"
                strokeDasharray="3 4"
              />

              {/* X AXIS */}
              <XAxis
                dataKey="shortName"
                axisLine={false}
                tickLine={false}
                interval={0}
                height={36}
                tick={{
                  fontSize: 10,
                  fill: "#98A2B3",
                  fontWeight: 500,
                }}
              />

              {/* Y AXIS */}
              <YAxis
                axisLine={false}
                tickLine={false}
                width={40}
                domain={[
                  0,
                  maxValue +
                    maxValue * 0.12,
                ]}
                tick={{
                  fontSize: 10,
                  fill: "#98A2B3",
                }}
              />

              {/* TOOLTIP */}
              <Tooltip
                cursor={{
                  fill:
                    "rgba(15,23,42,0.03)",
                }}
                contentStyle={{
                  borderRadius: 16,
                  border:
                    "1px solid #EAECF0",
                  background:
                    "rgba(255,255,255,0.98)",
                  boxShadow:
                    "0px 10px 30px rgba(15,23,42,0.10)",
                  padding:
                    "10px 14px",
                }}
                labelStyle={{
                  fontWeight: 700,
                  color: "#101828",
                  marginBottom: 6,
                }}
              />

              {/* BARS */}
              <Bar
                dataKey="average"
                fill="#2563EB"
                radius={[8, 8, 0, 0]}
                maxBarSize={14}
              />

              <Bar
                dataKey="good"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                maxBarSize={14}
              />

              <Bar
                dataKey="repairable"
                fill="#F59E0B"
                radius={[8, 8, 0, 0]}
                maxBarSize={14}
              />

              <Bar
                dataKey="damaged"
                fill="#EF4444"
                radius={[8, 8, 0, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default memo(
  AgingCategoryBarChart
);