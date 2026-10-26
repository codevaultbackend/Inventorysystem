"use client";

import { useMemo } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Item = {
  category: string;
  approved: number;
  pending: number;
  rejected: number;
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

  return (
    Math.ceil(value / 5000) *
    5000
  );
};

export default function PurchaseOrderTrendsChart({
  data,
  loading = false,
}: Props) {
  /* =========================================================
     NORMALIZE + MERGE DATA
  ========================================================= */

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    const normalizedMap =
      new Map<
        string,
        {
          originalLabel: string;
          approved: number;
          pending: number;
          rejected: number;
        }
      >();

    data.forEach((item) => {
      const originalCategory =
        String(
          item?.category || ""
        )
          .trim()
          .replace(/\s+/g, " ");

      if (!originalCategory) {
        return;
      }

      const normalizedKey =
        originalCategory.toLowerCase();

      const approved =
        Math.max(
          0,
          Number(
            item?.approved || 0
          )
        );

      const pending =
        Math.max(
          0,
          Number(
            item?.pending || 0
          )
        );

      const rejected =
        Math.max(
          0,
          Number(
            item?.rejected || 0
          )
        );

      const existing =
        normalizedMap.get(
          normalizedKey
        );

      if (existing) {
        normalizedMap.set(
          normalizedKey,
          {
            originalLabel:
              existing.originalLabel,

            approved:
              existing.approved +
              approved,

            pending:
              existing.pending +
              pending,

            rejected:
              existing.rejected +
              rejected,
          }
        );
      } else {
        normalizedMap.set(
          normalizedKey,
          {
            originalLabel:
              originalCategory,

            approved,
            pending,
            rejected,
          }
        );
      }
    });

    return Array.from(
      normalizedMap.entries()
    )
      .map(
        ([
          ,
          values,
        ]) => {
          const shortLabel =
            values.originalLabel
              .length > 14
              ? `${values.originalLabel.slice(
                  0,
                  14
                )}...`
              : values.originalLabel;

          return {
            category:
              shortLabel,

            fullCategory:
              values.originalLabel,

            approved:
              values.approved,

            pending:
              values.pending,

            rejected:
              values.rejected,

            total:
              values.approved +
              values.pending +
              values.rejected,
          };
        }
      )
      .sort(
        (a, b) =>
          b.total - a.total
      );
  }, [data]);

  /* =========================================================
     DYNAMIC HEIGHT
  ========================================================= */

  const dynamicHeight =
    useMemo(() => {
      if (
        chartData.length <= 4
      ) {
        return 280;
      }

      if (
        chartData.length <= 8
      ) {
        return 320;
      }

      return 360;
    }, [chartData]);

  /* =========================================================
     DYNAMIC WIDTH
  ========================================================= */

  const dynamicWidth =
    useMemo(() => {
      if (
        chartData.length <= 4
      ) {
        return "100%";
      }

      return `${
        chartData.length * 120
      }px`;
    }, [chartData]);

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
          item.approved,
          item.pending,
          item.rejected
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
          <div className="h-5 w-[220px] rounded-md bg-[#E5E7EB]" />

          <div className="mt-3 h-4 w-[180px] rounded-md bg-[#F1F5F9]" />

          <div className="mt-6 h-[320px] rounded-[20px] bg-[#F8FAFC]" />
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
              text-[18px]
              font-[700]
              leading-[28px]
              text-[#101828]
            "
          >
            Purchase Order Trends
          </h3>

          <p
            className="
              mt-1
              text-[12px]
              font-[400]
              leading-[16px]
              text-[#6A7282]
            "
          >
            Insights into procurement patterns
          </p>
        </div>

        <div
          className="
            flex
            h-[300px]
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
            📊
          </div>

          <p
            className="
              mt-4
              text-[14px]
              font-[600]
              text-[#475467]
            "
          >
            No purchase order data available
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
        shadow-[1px_1px_4px_0_#0000001A]
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
          p-4
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
            Purchase Order Trends
          </h3>

          <p
            className="
              mt-1
              text-[12px]
              font-[400]
              leading-[16px]
              text-[#6A7282]
            "
          >
            Insights into procurement patterns
          </p>
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
              Approved
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full bg-[#FACC15]" />

            <span
              className="
                text-[13px]
                font-[500]
                text-[#667085]
              "
            >
              Pending
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full bg-[#F87171]" />

            <span
              className="
                text-[13px]
                font-[500]
                text-[#667085]
              "
            >
              Rejected
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHART */}
      {/* ========================================================= */}

      <div className="mt-5 overflow-x-auto overflow-y-hidden">
        <div
          style={{
            width: dynamicWidth,
            height: dynamicHeight,
            minWidth: "100%",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
              barCategoryGap="18%"
            >
              {/* GRID */}

              <CartesianGrid
                stroke="#EEF2F6"
                strokeDasharray="3 4"
                vertical={false}
              />

              {/* X AXIS */}

              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                interval={0}
                tickMargin={14}
                height={56}
                minTickGap={20}
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
                  fill: "rgba(59,130,246,0.04)",
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
                labelFormatter={(
                  label
                ) => {
                  const item =
                    chartData.find(
                      (
                        d
                      ) =>
                        d.category ===
                        label
                    );

                  return (
                    item?.fullCategory ||
                    label
                  );
                }}
              />

              {/* REJECTED */}

              <Bar
                dataKey="rejected"
                fill="#F87171"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={22}
              />

              {/* PENDING */}

              <Bar
                dataKey="pending"
                fill="#FACC15"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={22}
              />

              {/* APPROVED */}

              <Bar
                dataKey="approved"
                fill="#22C55E"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}