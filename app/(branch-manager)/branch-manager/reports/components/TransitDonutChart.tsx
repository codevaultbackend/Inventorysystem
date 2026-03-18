"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Electricals", value: 25, color: "#2563EB" },
  { name: "Furnitures", value: 35, color: "#F97316" },
  { name: "Electronics", value: 25, color: "#06B6D4" },
  { name: "Raw Materials", value: 5, color: "#84CC16" },
  { name: "Others", value: 10, color: "#EC4899" },
];

export default function TransitDonutChart() {
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A]">
        Transit Goods
      </h3>
      <p className="text-[12px] text-[#64748B] mb-4">
        Goods currently out for delivery
      </p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
