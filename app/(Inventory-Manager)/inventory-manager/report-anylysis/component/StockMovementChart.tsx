"use client";

import { useMemo } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Item = {
  month: string;
  stockIn: number;
  stockOut: number;
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
  if (value >= 1000000) {
    return `${(
      value / 1000000
    ).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(
      value / 1000
    ).toFixed(1)}K`;
  }

  return value;
};

const formatTooltipValue = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
};

/* =========================================================
   CLEAN MAX SCALE
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

  return (
    Math.ceil(value / 5000) *
    5000
  );
};

export default function StockMovementChart({
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

        stockIn: Math.max(
          0,
          Number(
            item?.stockIn || 0
          )
        ),

        stockOut: Math.max(
          0,
          Number(
            item?.stockOut || 0
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

  const maxValue = useMemo(() => {
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
          item.stockIn,
          item.stockOut
        );
      }
    );

    return max;
  }, [chartData]);

  const roundedMax =
    useMemo(() => {
      return getRoundedMax(
        maxValue * 1.15
      );
    }, [maxValue]);

  const ticks = useMemo(() => {
    return Array.from(
      { length: 6 },
      (_, index) =>
        Math.round(
          (roundedMax / 5) *
            index
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
        return 260;
      }

      if (
        chartData.length <= 8
      ) {
        return 290;
      }

      return 320;
    }, [chartData]);

  /* =========================================================
     LOADING STATE
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
          p-4
          
          sm:p-5
        "
      >
        <div className="animate-pulse">
          <div className="h-5 w-[220px] rounded-md bg-[#E5E7EB]" />

          <div className="mt-6 h-[300px] rounded-[20px] bg-[#F8FAFC]" />
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
            Stock Movement Trends
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
            📈
          </div>

          <p
            className="
              mt-4
              text-[14px]
              font-[600]
              text-[#475467]
            "
          >
            No stock movement data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#EAECF0]
        bg-white
        p-4
        shadow-[0px_1px_2px_rgba(16,24,40,0.04)]
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
          gap-4
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="min-w-0">
          <h3
            className="
              text-[16px]
              font-[500]
              leading-[24px]
              text-[#101828]
            "
          >
            Stock Movement Trends
          </h3>
        </div>

        {/* LEGENDS */}

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
            <span className="h-[8px] w-[8px] rounded-full bg-[#22C55E]" />

            <span
              className="
                text-[13px]
                font-[500]
                text-[#667085]
              "
            >
              Stock In
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full bg-[#3B82F6]" />

            <span
              className="
                text-[13px]
                font-[500]
                text-[#667085]
              "
            >
              Stock Out
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
          <LineChart
            data={chartData}
            margin={{
              top: 12,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            {/* GRID */}

            <CartesianGrid
              stroke="#EEF2F6"
              strokeDasharray="3 4"
              vertical={false}
            />

            {/* X AXIS */}

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{
                fontSize: 11,
                fill: "#667085",
                fontWeight: 500,
              }}
            />

            {/* Y AXIS */}

            <YAxis
              axisLine={false}
              tickLine={false}
              width={52}
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

            {/* TOOLTIP */}

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
                formatTooltipValue(
                  value
                ),
              ]}
            />

            {/* STOCK IN */}

            <Line
              type="monotone"
              dataKey="stockIn"
              stroke="#22C55E"
              strokeWidth={3}
              dot={{
                r: 3,
                fill: "#22C55E",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
                fill: "#22C55E",
              }}
            />

            {/* STOCK OUT */}

            <Line
              type="monotone"
              dataKey="stockOut"
              stroke="#3B82F6"
              strokeWidth={3}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}