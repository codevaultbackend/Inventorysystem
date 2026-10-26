// components/BranchShareChart.tsx

"use client";

import React, { useMemo } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { PieChartIcon } from "lucide-react";

type CategoryItem = {
  category?: string;
  total?: string | number;
};

type Props = {
  data?: CategoryItem[];
};

const COLORS = [
  "#2F61D5",
  "#19B37A",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#84CC16",
];

const formatCurrency = (
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
    ).toFixed(1)}K`;
  }

  return `₹${value}`;
};

const normalizeCategory = (
  category?: string
) => {
  if (
    !category ||
    category.trim() === ""
  ) {
    return "Unknown";
  }

  const value =
    category.toLowerCase();

  // MERGE ELECTRONIC TYPES

  if (
    value.includes(
      "elect"
    ) ||
    value.includes("elec")
  ) {
    return "Electronics";
  }

  // MERGE FURNITURE TYPES

  if (
    value.includes("furn")
  ) {
    return "Furniture";
  }

  return category
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
};

export default function BranchShareChart({
  data = [],
}: Props) {
  const processedData = useMemo(() => {
    console.log(
      "RAW CATEGORY DATA:",
      data
    );

    if (!Array.isArray(data)) {
      console.error(
        "CATEGORY DATA IS NOT ARRAY"
      );

      return [];
    }

    // REMOVE INVALID

    const filtered = data.filter(
      (item) => {
        const amount = Number(
          item?.total || 0
        );

        return amount > 0;
      }
    );

    console.log(
      "FILTERED CATEGORY:",
      filtered
    );

    // GROUP SAME CATEGORY

    const grouped =
      filtered.reduce(
        (
          acc: Record<
            string,
            number
          >,
          item
        ) => {
          const category =
            normalizeCategory(
              item?.category
            );

          const amount =
            Number(
              item?.total || 0
            );

          if (!acc[category]) {
            acc[category] = 0;
          }

          acc[category] += amount;

          return acc;
        },
        {}
      );

    console.log(
      "GROUPED CATEGORY:",
      grouped
    );

    // FINAL FORMAT

    const formatted =
      Object.entries(grouped)
        .map(
          ([name, value]) => ({
            name,
            value,
          })
        )
        .sort(
          (a, b) =>
            b.value - a.value
        );

    console.log(
      "FINAL CHART DATA:",
      formatted
    );

    return formatted;
  }, [data]);

  const total = useMemo(() => {
    return processedData.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );
  }, [processedData]);

  // EMPTY STATE

  if (
    !processedData ||
    processedData.length === 0
  ) {
    return (
      <div className="w-full h-full bg-white rounded-[24px] border border-[#E8EDF5] shadow-[1px_1px_4px_0px_#0000001A] p-6 flex items-center justify-center">
        <p className="text-sm text-gray-400">
          No category data available
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[442px] bg-white rounded-[24px] border border-[#E8EDF5] shadow-[1px_1px_4px_0px_#0000001A] overflow-hidden">
      {/* MAIN */}

      <div className="flex flex-col h-full p-4 sm:p-5 md:p-6">
        {/* HEADER */}

        <div className="flex items-center gap-3 sm:gap-4 mb-5 shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <PieChartIcon
              className="text-[#5B5BD6]"
              size={24}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-[120%] text-[#111827] truncate">
              Categorywise Share
            </h2>

            <p className="text-[13px] sm:text-[14px] text-[#6B7280] mt-1">
              Revenue contribution
            </p>
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 flex flex-col justify-between min-h-0">
          {/* CHART */}

          <div className="flex items-center justify-center w-full flex-1 min-h-0">
            <div className="w-full h-full max-w-[340px] max-h-[340px] min-h-[240px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={processedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {processedData.map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  {/* TOOLTIP */}

                  <Tooltip
                    contentStyle={{
                      borderRadius:
                        "14px",
                      border:
                        "1px solid #E5E7EB",
                      boxShadow:
                        "0 10px 25px rgba(0,0,0,0.08)",
                      fontSize:
                        "13px",
                    }}
                    formatter={(
                      value: number,
                      name
                    ) => {
                      const percentage =
                        (
                          (value /
                            total) *
                          100
                        ).toFixed(1);

                      return [
                        `${formatCurrency(
                          value
                        )} (${percentage}%)`,
                        name,
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CUSTOM LEGEND */}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 shrink-0">
            {processedData
              .slice(0, 6)
              .map(
                (item, index) => {
                  const percentage =
                    (
                      (item.value /
                        total) *
                      100
                    ).toFixed(1);

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 min-w-0"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            background:
                              COLORS[
                                index %
                                  COLORS.length
                              ],
                          }}
                        />

                        <span className="text-[13px] sm:text-sm text-[#374151] truncate">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-[13px] sm:text-sm font-semibold text-[#111827] shrink-0">
                        {percentage}%
                      </span>
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </div>
    </div>
  );
}