"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { name: "Electrical", repairable: 700, scrap: 400 },
  { name: "Electronics", repairable: 1000, scrap: 1000 },
  { name: "Raw Material", repairable: 1000, scrap: 1000 },
  { name: "Interior", repairable: 1000, scrap: 1000 },
];

export default function ScrapRepairChart() {
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A]">
        Scrap & Repairable Stock
      </h3>
      <p className="text-[12px] text-[#64748B] mb-4">
        Track Scrap and repairable goods
      </p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar dataKey="repairable" fill="#FACC15" radius={[6, 6, 0, 0]} />
            <Bar dataKey="scrap" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
