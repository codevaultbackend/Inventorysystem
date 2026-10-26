// ======================================
// PurchaseAmountChart.tsx
// Fully Fixed Enterprise Production Version
// ======================================

"use client";

import React, {
  memo,
  useId,
  useMemo,
} from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartItem = {
  month: string;
  amount: number;
};

type Props = {
  data: ChartItem[];
};

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function sanitizeData(
  rawData: ChartItem[]
) {
  if (
    !Array.isArray(rawData)
  ) {
    return [];
  }

  return rawData
    .filter(
      (item) =>
        item &&
        typeof item.month ===
          "string"
    )
    .map((item) => ({
      month:
        item.month?.trim() ||
        "Unknown",

      amount: Number.isFinite(
        Number(item.amount)
      )
        ? Number(item.amount)
        : 0,
    }))
    .sort((a, b) => {
      const aIndex =
        MONTH_ORDER.indexOf(
          a.month
        );

      const bIndex =
        MONTH_ORDER.indexOf(
          b.month
        );

      return (
        aIndex - bIndex
      );
    });
}

function formatCurrency(
  value: number
) {
  const absValue =
    Math.abs(value);

  if (
    absValue >= 1000000000
  ) {
    return `₹${(
      value / 1000000000
    ).toFixed(1)}B`;
  }

  if (
    absValue >= 1000000
  ) {
    return `₹${(
      value / 1000000
    ).toFixed(1)}M`;
  }

  if (
    absValue >= 1000
  ) {
    return `₹${(
      value / 1000
    ).toFixed(1)}K`;
  }

  return `₹${value}`;
}

const CustomTooltip = memo(
  function CustomTooltip({
    active,
    payload,
    label,
  }: any) {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    return (
      <div
        className="
          rounded-[14px]
          border
          border-[#EAECF0]
          bg-white
          px-4
          py-3
          shadow-[0px_6px_18px_rgba(16,24,40,0.08)]
        "
      >
        <p
          className="
            text-[12px]
            font-medium
            text-[#667085]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-[15px]
            font-semibold
            text-[#111827]
          "
        >
          {formatCurrency(
            payload?.[0]
              ?.value || 0
          )}
        </p>
      </div>
    );
  }
);

function EmptyState() {
  return (
    <div
      className="
        flex
        h-[260px]
        flex-col
        items-center
        justify-center
        rounded-[20px]
        border
        border-dashed
        border-[#E4E7EC]
        bg-[#FCFCFD]
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-[50px]
          w-[50px]
          items-center
          justify-center
          rounded-full
          bg-[#EEF4FF]
        "
      >
        <div
          className="
            h-[18px]
            w-[18px]
            rounded-full
            bg-[#3B82F6]
          "
        />
      </div>

      <h3
        className="
          mt-4
          text-[15px]
          font-semibold
          text-[#111827]
        "
      >
        No Purchase Data
      </h3>

      <p
        className="
          mt-1
          max-w-[260px]
          text-[13px]
          font-medium
          leading-[20px]
          text-[#667085]
        "
      >
        Purchase analytics
        will appear once
        inventory data is
        available.
      </p>
    </div>
  );
}

export default memo(
  function PurchaseAmountChart({
    data,
  }: Props) {
    const gradientId =
      useId();

    const safeData =
      useMemo(
        () =>
          sanitizeData(data),
        [data]
      );

    const hasData =
      safeData.length > 0;

    const maxValue =
      Math.max(
        ...safeData.map(
          (d) =>
            d.amount || 0
        ),
        1000
      );

    const minValue =
      Math.min(
        ...safeData.map(
          (d) =>
            d.amount || 0
        ),
        0
      );

    if (!hasData) {
      return <EmptyState />;
    }

    return (
      <section
        role="img"
        aria-label="Purchase amount over time chart"
        className="
          flex
          min-h-[360px]
          w-full
          flex-col
          rounded-[20px]
          border
          border-[#EAECF0]
          bg-white
          p-5
          shadow-[0px_1px_4px_rgba(16,24,40,0.04)]
          sm:p-6
        "
      >
        {/* HEADER */}
        <div
          className="
            mb-3
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <h2
            className="
              text-[18px]
              font-semibold
              tracking-[-0.3px]
              text-[#111827]
              sm:text-[20px]
            "
          >
            Purchase Amount
            Over Time
          </h2>

          {/* FILTER BUTTON */}
          <button
            type="button"
            aria-label="Monthly analytics"
            className="
              flex
              h-[38px]
              items-center
              gap-2
              rounded-[12px]
              border
              border-[#E4E7EC]
              bg-white
              px-4
              text-[13px]
              font-medium
              text-[#344054]
              transition-all
              duration-200
              hover:bg-[#F9FAFB]
            "
          >
            Monthly

            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#667085"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* CHART */}
        <div
          className="
            h-[260px]
            w-full
            sm:h-[300px]
            lg:h-[320px]
          "
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={safeData}
              margin={{
                top: 8,
                right: 12,
                left: 6,
                bottom: 0,
              }}
            >
              {/* GRADIENT */}
              <defs>
                <linearGradient
                  id={`purchaseFill-${gradientId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#3B82F6"
                    stopOpacity={
                      0.22
                    }
                  />

                  <stop
                    offset="100%"
                    stopColor="#3B82F6"
                    stopOpacity={
                      0.03
                    }
                  />
                </linearGradient>
              </defs>

              {/* GRID */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F2F4F7"
              />

              {/* X AXIS */}
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                interval="preserveStartEnd"
                minTickGap={28}
                tick={{
                  fill: "#667085",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />

              {/* Y AXIS */}
              <YAxis
                domain={[
                  minValue,
                  maxValue,
                ]}
                axisLine={false}
                tickLine={false}
                width={72}
                tickMargin={12}
                tickFormatter={(
                  value
                ) =>
                  formatCurrency(
                    value
                  )
                }
                tick={{
                  fill: "#667085",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />

              {/* TOOLTIP */}
              <Tooltip
                isAnimationActive
                cursor={{
                  stroke:
                    "#D0D5DD",
                  strokeDasharray:
                    "4 4",
                }}
                content={
                  <CustomTooltip />
                }
              />

              {/* AREA */}
              <Area
                type="natural"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={3}
                fill={`url(#purchaseFill-${gradientId})`}
                dot={false}
                animationDuration={
                  700
                }
                animationEasing="ease-out"
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "#FFFFFF",
                  stroke:
                    "#3B82F6",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    );
  }
);