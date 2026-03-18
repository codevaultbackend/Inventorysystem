"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChartIcon } from "lucide-react";

type Branch = {
  name: string;
  value: number;
};

const data: Branch[] = [
  { name: "Mumbai HQ", value: 45 },
  { name: "Delhi Branch", value: 25 },
  { name: "Bangalore", value: 20 },
  { name: "Pune", value: 10 },
];

const COLORS = ["#2F61D5", "#19B37A", "#F59E0B", "#EF4444"];

export default function BranchShareChart() {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8">

      {/* Header */}

      <div className="flex items-center gap-4 sm:gap-5 mb-6">

        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#E3E6F3] rounded-xl flex items-center justify-center">
          <PieChartIcon className="text-[#5B5BD6]" size={22} />
        </div>

        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
            Branch Share
          </h2>

          <p className="text-xs sm:text-sm text-gray-500">
            Revenue contribution
          </p>
        </div>

      </div>

      {/* Chart */}

      <div className=" max-w-[380px] w-full aspect-square max-h-[360px]">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={4}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number, name: string) => [
                `${value}%`,
                name,
              ]}
            />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}