// components/CashflowChart.tsx

"use client";

import React, { useMemo } from "react";

import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import { BarChart3 } from "lucide-react";

type CashflowItem = {
  month?: string;

  month_no?: number;

  inflow?: string | number;

  outflow?: string | number;

  amount?: string | number;
};

type Props = {
  data?: CashflowItem[];
};

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

export default function CashflowChart({
  data = [],
}: Props) {
  const processedData = useMemo(() => {
    // FIXED MAP ERROR

    if (!Array.isArray(data)) {
      return [];
    }

    // SORT MONTHS

    const sortedData = [...data].sort(
      (a, b) =>
        (a?.month_no || 0) -
        (b?.month_no || 0)
    );

    return sortedData.map((item) => ({
      month: item?.month || "",

      inflow: Number(
        item?.inflow || 0
      ),

      outflow: Number(
        item?.outflow || 0
      ),

      amount: Number(
        item?.amount || 0
      ),
    }));
  }, [data]);

  return (
    <div className="w-full h-full bg-white rounded-[24px] border border-[#E8EDF5] shadow-[1px_1px_4px_0px_#0000001A] p-4 sm:p-5 md:p-6 overflow-hidden">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF4FF] flex items-center justify-center shrink-0">
            <BarChart3
              className="text-[#2563EB]"
              size={24}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-[120%] text-[#111827] truncate">
              Monthly Cashflow Analysis
            </h2>

            <p className="text-[13px] sm:text-[14px] text-[#6B7280] mt-1">
              Comparison of inflow and
              outflow
            </p>
          </div>
        </div>

      </div>

      {/* EMPTY STATE */}

      {processedData.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-sm text-gray-400">
          No cashflow data available
        </div>
      ) : (
        <div className="w-full overflow-x-auto overflow-y-hidden">
          {/* RESPONSIVE WIDTH */}

          <div className="min-w-[650px] w-full h-[320px] sm:h-[360px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={processedData}
                barCategoryGap={18}
                margin={{
                  top: 10,
                  right: 10,
                  left: -12,
                  bottom: 0,
                }}
              >
                {/* GRID */}

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#E5E7EB"
                />

                {/* X AXIS */}

                <XAxis
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                {/* Y AXIS */}

                <YAxis
                  tickFormatter={(value) =>
                    formatCurrency(value)
                  }
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />

                {/* TOOLTIP */}

                <Tooltip
                  cursor={{
                    fill:
                      "rgba(59,130,246,0.06)",
                  }}
                  contentStyle={{
                    borderRadius: "14px",
                    border:
                      "1px solid #E5E7EB",
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  formatter={(
                    value: number
                  ) =>
                    formatCurrency(value)
                  }
                />

                {/* LEGEND */}

                <Legend
                  wrapperStyle={{
                    fontSize: "13px",
                  }}
                />

                {/* INFLOW */}

                <Bar
                  dataKey="inflow"
                  name="Inflow"
                  fill="#A8C5F0"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={42}
                />

                {/* OUTFLOW */}

                <Bar
                  dataKey="outflow"
                  name="Outflow"
                  fill="#2F61D5"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}