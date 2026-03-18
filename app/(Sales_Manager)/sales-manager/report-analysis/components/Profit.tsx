"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export default function Profit() {

  const data = [
    { month: "Jan", profit: 18000 },
    { month: "Feb", profit: 22000 },
    { month: "Mar", profit: 20000 },
    { month: "Apr", profit: 26000 },
    { month: "May", profit: 24000 },
    { month: "Jun", profit: 28000 }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
        Monthly Profit Analysis
      </h3>

      {/* Chart */}
      <div className="w-full h-[300px]">

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Bar
              dataKey="profit"
              fill="#6366F1"
              radius={[6, 6, 0, 0]}
              barSize={36}
              name="Profit ($)"
            />

          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}