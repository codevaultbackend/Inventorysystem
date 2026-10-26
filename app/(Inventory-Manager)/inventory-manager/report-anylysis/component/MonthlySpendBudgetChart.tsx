"use client";

import { useMemo } from "react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

type Item = {
  month: string;
  actual: number;
  budget: number;
};

type Props = {
  data: Item[];
  loading?: boolean;
};

/* =========================================================
   FORMATTERS
========================================================= */

const formatYAxis = (
  value: number
) => {
  if (value >= 10000000) {
    return `${(
      value / 10000000
    ).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `${(
      value / 100000
    ).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `${(
      value / 1000
    ).toFixed(0)}K`;
  }

  return `${value}`;
};

const formatTooltip = (
  value: number
) => {
  if (value >= 10000000) {
    return `₹${(
      value / 10000000
    ).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(
      value / 100000
    ).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(
      value / 1000
    ).toFixed(0)}K`;
  }

  return `₹${value}`;
};

/* =========================================================
   CLEAN SCALE
========================================================= */

const getRoundedMax = (
  value: number
) => {
  if (value <= 10) {
    return 10;
  }

  if (value <= 100) {
    return (
      Math.ceil(value / 10) * 10
    );
  }

  if (value <= 1000) {
    return (
      Math.ceil(value / 100) *
      100
    );
  }

  if (value <= 10000) {
    return (
      Math.ceil(value / 1000) *
      1000
    );
  }

  if (value <= 100000) {
    return (
      Math.ceil(value / 10000) *
      10000
    );
  }

  return (
    Math.ceil(value / 50000) *
    50000
  );
};

export default function MonthlySpendBudgetChart({
  data,
  loading = false,
}: Props) {
  /* =========================================================
     NORMALIZE DATA
  ========================================================= */

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => ({
        month: String(
          item?.month || ""
        ).trim(),

        actual: Math.max(
          0,
          Number(
            item?.actual || 0
          )
        ),

        budget: Math.max(
          0,
          Number(
            item?.budget || 0
          )
        ),
      }))
      .filter(
        (item) => item.month
      );
  }, [data]);

  /* =========================================================
     MAX VALUE
  ========================================================= */

  const maxDataValue =
    useMemo(() => {
      if (
        !chartData.length
      ) {
        return 100;
      }

      let max = 0;

      chartData.forEach(
        (item) => {
          max = Math.max(
            max,
            item.actual,
            item.budget
          );
        }
      );

      return max;
    }, [chartData]);

  const roundedMax =
    useMemo(() => {
      return getRoundedMax(
        maxDataValue * 1.12
      );
    }, [maxDataValue]);

  const ticks = useMemo(() => {
    return Array.from(
      { length: 6 },
      (_, i) =>
        Math.round(
          (roundedMax / 5) *
            i
        )
    );
  }, [roundedMax]);

  /* =========================================================
     DYNAMIC HEIGHT
  ========================================================= */

  const chartHeight =
    useMemo(() => {
      if (
        chartData.length <= 4
      ) {
        return 250;
      }

      if (
        chartData.length <= 8
      ) {
        return 280;
      }

      return 310;
    }, [chartData]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className="
          overflow-hidden
          rounded-[20px]
          border
          border-[#EAECF0]
          bg-white
          p-5
          shadow-[1px_1px_4px_0_#0000001A]
        "
      >
        <div className="animate-pulse">
          <div className="h-5 w-[240px] rounded-md bg-[#E5E7EB]" />

          <div className="mt-6 h-[280px] rounded-[20px] bg-[#F8FAFC]" />
        </div>
      </div>
    );
  }

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (!chartData.length) {
    return (
      <div
        className="
          overflow-hidden
          rounded-[20px]
          border
          border-[#EAECF0]
          bg-white
          p-5
          shadow-[1px_1px_4px_0_#0000001A]
        "
      >
        <div>
          <h3
            className="
              text-[16px]
              font-[500]
              leading-[24px]
              text-[#101828]
            "
          >
            Monthly Spend vs Budget
          </h3>
        </div>

        <div
          className="
            flex
            h-[280px]
            flex-col
            items-center
            justify-center
          "
        >
          <div
            className="
              rounded-full
              bg-[#F2F4F7]
              p-5
            "
          >
            📉
          </div>

          <p
            className="
              mt-4
              text-[14px]
              font-[600]
              text-[#475467]
            "
          >
            No spend data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-[20px]
        border
        border-[#EAECF0]
        bg-white
        p-4
        shadow-[1px_1px_4px_0_#0000001A]
        sm:p-5
      "
    >
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h3
            className="
              text-[16px]
              font-[500]
              leading-[24px]
              text-[#101828]
            "
          >
            Monthly Spend vs Budget
          </h3>

        </div>

        {/* LEGEND */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-5
            gap-y-2
          "
        >
          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full bg-[#3B82F6]" />

            <span
              className="
                text-[13px]
                font-[500]
                text-[#667085]
              "
            >
              Actual Spend
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full bg-[#94A3B8]" />

            <span
              className="
                text-[13px]
                font-[500]
                text-[#667085]
              "
            >
              Budget
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHART */}
      {/* ========================================================= */}

      <div
        className="mt-5 w-full"
        style={{
          height: chartHeight,
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 12,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            {/* ========================================================= */}
            {/* GRADIENT */}
            {/* ========================================================= */}

            <defs>
              <linearGradient
                id="actualGradient"
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

            {/* ========================================================= */}
            {/* GRID */}
            {/* ========================================================= */}

            <CartesianGrid
              vertical={false}
              stroke="#EEF2F6"
              strokeDasharray="3 4"
            />

            {/* ========================================================= */}
            {/* X AXIS */}
            {/* ========================================================= */}

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              interval={0}
              minTickGap={24}
              padding={{
                left: 8,
                right: 8,
              }}
              tick={{
                fontSize: 11,
                fill: "#667085",
                fontWeight: 500,
              }}
            />

            {/* ========================================================= */}
            {/* Y AXIS */}
            {/* ========================================================= */}

            <YAxis
              axisLine={false}
              tickLine={false}
              width={54}
              ticks={ticks}
              domain={[
                0,
                roundedMax,
              ]}
              tickFormatter={
                formatYAxis
              }
              tick={{
                fontSize: 11,
                fill: "#667085",
                fontWeight: 500,
              }}
            />

            {/* ========================================================= */}
            {/* TOOLTIP */}
            {/* ========================================================= */}

            <Tooltip
              cursor={{
                stroke:
                  "#D0D5DD",
                strokeWidth: 1,
                strokeDasharray:
                  "4 4",
              }}
              contentStyle={{
                borderRadius: 14,

                border:
                  "1px solid #EAECF0",

                background:
                  "#FFFFFF",

                boxShadow:
                  "0px 4px 14px rgba(16,24,40,0.08)",

                padding:
                  "10px 12px",
              }}
              labelStyle={{
                color:
                  "#101828",

                fontSize:
                  "12px",

                fontWeight: 600,

                marginBottom:
                  "6px",
              }}
              itemStyle={{
                fontSize:
                  "12px",

                fontWeight: 500,

                color:
                  "#475467",
              }}
              formatter={(
                value: number
              ) => [
                formatTooltip(
                  value
                ),
              ]}
            />

            {/* ========================================================= */}
            {/* BUDGET LINE */}
            {/* ========================================================= */}

            <ReferenceLine
              y={
                chartData.reduce(
                  (
                    sum,
                    item
                  ) =>
                    sum +
                    item.budget,
                  0
                ) /
                chartData.length
              }
              stroke="#94A3B8"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />

            {/* ========================================================= */}
            {/* AREA */}
            {/* ========================================================= */}

            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#actualGradient)"
              dot={{
                r: 3,
                fill: "#3B82F6",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
                fill: "#3B82F6",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}