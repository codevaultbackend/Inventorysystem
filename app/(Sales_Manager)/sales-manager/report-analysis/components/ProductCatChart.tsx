"use client"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

export default function ProductCatChart() {

  const data = [
    { name: "Electronics", value: 35, color: "#3B82F6" },
    { name: "Furniture", value: 25, color: "#8B5CF6" },
    { name: "Office Supplies", value: 20, color: "#EC4899" },
    { name: "Equipment", value: 15, color: "#F59E0B" },
    { name: "Others", value: 5, color: "#10B981" }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
        Product Category Distribution
      </h3>

      {/* Chart + Labels */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

        {/* Pie Chart */}
        <div className="w-full max-w-[260px] h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={0}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Labels */}
        <div className="flex flex-col gap-2 text-sm">

          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">

              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-gray-700 font-medium">
                {item.name}: {item.value}%
              </span>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}