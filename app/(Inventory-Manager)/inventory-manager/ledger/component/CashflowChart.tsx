"use client";

import React from "react";

type Cashflow = {
  month: string;
  value: number;
};

const data: Cashflow[] = [
  { month: "Jan", value: 4500000 },
  { month: "Feb", value: 5200000 },
  { month: "Mar", value: 4800000 },
  { month: "Apr", value: 6100000 },
  { month: "May", value: 5400000 },
  { month: "Jun", value: 6700000 },
  { month: "Jul", value: 6600000 },
];

const maxValue = 7000000;

export default function CashflowChart() {
  return (
    <div className="w-full h-full flex flex-col">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

        <div className="flex items-center gap-3">

          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 18V6M10 18V2M16 18v-8" />
            </svg>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Monthly Cashflow Analysis
            </h2>

            <p className="text-xs sm:text-sm text-gray-500">
              Comparison of inflow and outflow
            </p>
          </div>

        </div>

        <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 bg-white shadow-sm">
          <option>Monthly</option>
          <option>Yearly</option>
        </select>

      </div>

      {/* CHART */}

      <div className="relative w-full flex-1">

        {/* GRID */}

        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="border-t border-dashed border-gray-200 w-full"
            />
          ))}
        </div>

        {/* BARS */}

        <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-4">

          {data.map((item) => {
            const height = (item.value / maxValue) * 100;

            return (
              <div
                key={item.month}
                className="flex flex-col items-center justify-end flex-1 h-full"
              >

                <div
                  style={{ height: `${height}%` }}
                  className="
                    w-full
                    max-w-[22px]
                    sm:max-w-[30px]
                    md:max-w-[38px]
                    lg:max-w-[46px]
                    rounded-md
                    bg-[#a8c3e6]
                    hover:bg-[#8fb3e3]
                    transition-all
                    duration-300
                  "
                />

                <span className="text-[10px] sm:text-xs text-gray-500 mt-2">
                  {item.month}
                </span>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}