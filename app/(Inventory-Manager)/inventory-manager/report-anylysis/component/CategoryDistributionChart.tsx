"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Item = {
  name: string;
  value: number;
  color?: string;
};

type Props = {
  data: Item[];
  loading?: boolean;
};

/* =========================================================
   FORMAT NUMBER
========================================================= */

const formatNumber = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
};

/* =========================================================
   DEFAULT COLORS
========================================================= */

const DEFAULT_COLORS = [
  "#3B82F6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#C026D3",
  "#14B8A6",
  "#F43F5E",
];

/* =========================================================
   COMPONENT
========================================================= */

export default function CategoryDistributionChart({
  data,
  loading = false,
}: Props) {
  /* =========================================================
     ACTIVE SLICE
  ========================================================= */

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  /* =========================================================
     NORMALIZE DATA
  ========================================================= */

  const chartData = useMemo(() => {
    if (
      !Array.isArray(data)
    ) {
      return [];
    }

    const normalizedMap =
      new Map<
        string,
        {
          originalName: string;
          value: number;
          color: string;
        }
      >();

    data.forEach(
      (
        item,
        index
      ) => {
        const rawName =
          String(
            item?.name || ""
          )
            .trim()
            .replace(
              /\s+/g,
              " "
            );

        if (!rawName) {
          return;
        }

        const numericValue =
          Math.max(
            0,
            Number(
              item?.value || 0
            )
          );

        if (
          numericValue <= 0
        ) {
          return;
        }

        const normalizedKey =
          rawName.toLowerCase();

        const existing =
          normalizedMap.get(
            normalizedKey
          );

        const safeColor =
          item?.color ||
          DEFAULT_COLORS[
            index %
              DEFAULT_COLORS.length
          ];

        if (existing) {
          normalizedMap.set(
            normalizedKey,
            {
              ...existing,

              value:
                existing.value +
                numericValue,
            }
          );
        } else {
          normalizedMap.set(
            normalizedKey,
            {
              originalName:
                rawName,

              value:
                numericValue,

              color:
                safeColor,
            }
          );
        }
      }
    );

    const cleaned =
      Array.from(
        normalizedMap.entries()
      )
        .map(
          ([
            ,
            item,
          ]) => {
            const shortName =
              item
                .originalName
                .length > 18
                ? `${item.originalName.slice(
                    0,
                    18
                  )}...`
                : item.originalName;

            return {
              name:
                shortName,

              fullName:
                item.originalName,

              value:
                item.value,

              color:
                item.color,
            };
          }
        )
        .sort(
          (a, b) =>
            b.value -
            a.value
        );

    const topFive =
      cleaned.slice(0, 5);

    const remaining =
      cleaned.slice(5);

    if (
      remaining.length > 0
    ) {
      const othersTotal =
        remaining.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.value,
          0
        );

      topFive.push({
        name: "Others",
        fullName:
          "Others",
        value:
          othersTotal,
        color:
          "#D0D5DD",
      });
    }

    return topFive;
  }, [data]);

  /* =========================================================
     TOTAL
  ========================================================= */

  const total =
    useMemo(() => {
      return chartData.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.value,
        0
      );
    }, [chartData]);

  const activeItem =
    chartData[
      activeIndex
    ];

  /* =========================================================
     DYNAMIC DONUT SIZE
  ========================================================= */

  const chartHeight =
    useMemo(() => {
      if (
        chartData.length <= 3
      ) {
        return 240;
      }

      if (
        chartData.length <= 5
      ) {
        return 270;
      }

      return 300;
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
          p-4
          shadow-[1px_1px_4px_0_#0000001A]
          sm:p-5
        "
      >
        <div className="animate-pulse">
          <div className="h-5 w-[200px] rounded-md bg-[#E5E7EB]" />

          <div className="mt-3 h-4 w-[160px] rounded-md bg-[#F1F5F9]" />

          <div className="mt-6 h-[300px] rounded-[20px] bg-[#F8FAFC]" />
        </div>
      </div>
    );
  }

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (
    !chartData.length
  ) {
    return (
      <div
        className="
          overflow-hidden
          rounded-[24px]
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
            Category Distribution
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
            Inventory breakdown by category
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
            No category data available
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

      <div>
        <h3
          className="
            text-[16px]
              font-[500]
              leading-[24px]
              text-[#101828]
          "
        >
          Category Distribution
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
          Inventory breakdown by category
        </p>
      </div>

      {/* ========================================================= */}
      {/* CONTENT */}
      {/* ========================================================= */}

      <div
        className="
          mt-6
          flex
          flex-col
          gap-8
          max-[768px]:gap-1
          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >
        {/* ========================================================= */}
        {/* CHART */}
        {/* ========================================================= */}

        <div
          className="
            relative
            flex
            flex-1
            items-center
            justify-center
          "
        >
          {/* ACTIVE CARD */}

          {activeItem && (
            <div
              className="
                absolute
                right-0
                top-0
                z-10
                rounded-[20px]
                border
                border-[#EAECF0]
                bg-white
                px-3
                py-2
                shadow-[1px_1px_4px_0_#0000001A]
                transition-all
                duration-200
              "
            >
              <div
                className="
                  max-w-[160px]
                  truncate
                  text-[13px]
                  font-[600]
                  text-[#101828]
                "
              >
                {activeItem.fullName}
              </div>

              <div
                className="
                  mt-1
                  text-[12px]
                  font-[500]
                  text-[#667085]
                "
              >
                {formatNumber(
                  activeItem.value
                )}{" "}
                Items
              </div>
            </div>
          )}

          {/* CENTER LABEL */}

          <div
            className="
              pointer-events-none
              absolute
              z-10
              flex
              flex-col
              items-center
              justify-center
            "
          >
            <div
              className="
                text-[38px]
                font-[700]
                tracking-[-0.04em]
                leading-none
                text-[#101828]
                sm:text-[42px]
              "
            >
              {formatNumber(
                total
              )}
            </div>

            <div
              className="
                mt-2
                text-[13px]
                font-[500]
                text-[#667085]
              "
            >
              Total Items
            </div>
          </div>

          {/* PIE */}

          <div
            style={{
              height:
                chartHeight,
            }}
            className="
              w-full
              max-w-[320px]
              sm:max-w-[360px]
            "
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Tooltip
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
                    formatNumber(
                      value
                    ),
                  ]}
                />

                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={102}
                  paddingAngle={6}
                  cornerRadius={10}
                  stroke="#FFFFFF"
                  strokeWidth={6}
                  activeIndex={
                    activeIndex
                  }
                  onMouseEnter={(
                    _,
                    index
                  ) =>
                    setActiveIndex(
                      index
                    )
                  }
                >
                  {chartData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={`${entry.fullName}-${index}`}
                        fill={
                          entry.color
                        }
                        style={{
                          transition:
                            "all 0.2s ease",
                          opacity:
                            activeIndex ===
                            index
                              ? 1
                              : 0.9,
                        }}
                      />
                    )
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LEGENDS */}
        {/* ========================================================= */}

        <div
          className="
            w-full
            xl:max-w-[240px]
          "
        >
          <div className="space-y-2">
            {chartData.map(
              (
                item,
                index
              ) => {
                const percentage =
                  (
                    (item.value /
                      total) *
                    100
                  ).toFixed(0);

                const isActive =
                  activeIndex ===
                  index;

                return (
                  <button
                    key={
                      item.fullName
                    }
                    onMouseEnter={() =>
                      setActiveIndex(
                        index
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-[14px]
                      
                      text-left
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "bg-[#F9FAFB]"
                          : "hover:bg-[#F9FAFB]"
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          h-[10px]
                          w-[10px]
                          flex-shrink-0
                          rounded-full
                        "
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />

                      <span
                        className="
                          truncate
                          text-[14px]
                          font-[500]
                          text-[#344054]
                        "
                      >
                        {item.name}
                      </span>
                    </div>

                    <div
                      className="
                        ml-3
                        flex-shrink-0
                        text-[13px]
                        font-[600]
                        text-[#667085]
                      "
                    >
                      {percentage}%
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}