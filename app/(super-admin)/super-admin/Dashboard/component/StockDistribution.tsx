"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Electricals", value: 25, color: "#2563EB" },
  { name: "Furnitures", value: 35, color: "#FF5C1B" },
  { name: "Electronics", value: 25, color: "#22B8CF" },
  { name: "Raw Materials", value: 5, color: "#8CD867" },
  { name: "Furnitures 2", value: 10, color: "#C0268C" },
];

export default function StockDistribution() {
  return (
    <div
      className="
        bg-[#F8FAFC]
        rounded-2xl
        border border-[#E2E8F0]
        shadow-[0_6px_20px_rgba(0,0,0,0.03)]
        p-6
        w-full
        min-h-[320px]
      "
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-[18px] font-semibold text-[#0F172A]">
          Stock Distribution
        </h3>
        <p className="text-[13px] text-[#64748B] mt-1">
          Category-wise Breakdown
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col xl:flex-row items-center gap-8">

        {/* Donut */}
        <div className="relative w-full xl:w-[55%] h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={75}
                outerRadius={110}
                paddingAngle={8}
                cornerRadius={30}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Outside Percentage Labels */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 35% Top Right */}
            <div className="absolute top-6 right-0 text-[#FF5C1B] text-[14px] font-semibold">
              35%
            </div>

            {/* 25% Bottom Right */}
            <div className="absolute bottom-10 right-0 text-[#2563EB] text-[14px] font-semibold">
              25%
            </div>

            {/* 25% Bottom Left */}
            <div className="absolute bottom-10 left-0 text-[#22B8CF] text-[14px] font-semibold">
              25%
            </div>

            {/* 10% Middle Left */}
            <div className="absolute top-[50%] -translate-y-1/2 left-0 text-[#C0268C] text-[14px] font-semibold">
              10%
            </div>

            {/* 5% Top Left */}
            <div className="absolute top-10 left-6 text-[#8CD867] text-[14px] font-semibold">
              5%
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full xl:w-[45%] space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[14px] text-[#334155]">
                  {item.name}
                </span>
              </div>

              <span className="text-[14px] font-semibold text-[#0F172A]">
                {item.value}%
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
