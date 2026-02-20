"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { name: "Mumbai", repairable: 4, scrap: 3 },
  { name: "Bangalore", repairable: 8, scrap: 6 },
  { name: "Hyderabad", repairable: 30, scrap: 18 },
  { name: "Kolkata", repairable: 5, scrap: 23 },
  { name: "Patna", repairable: 12, scrap: 21 },
  { name: "Ahmedabad", repairable: 38, scrap: 32 },
];

export default function SalesTrendChart() {
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A]">
        Sales & Purchase Trends
      </h3>
      <p className="text-[12px] text-[#64748B] mb-4">
        Track sales and purchase trends
      </p>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="repairable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="scrap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="repairable"
              stroke="#22C55E"
              fill="url(#repairable)"
            />
            <Area
              type="monotone"
              dataKey="scrap"
              stroke="#EF4444"
              fill="url(#scrap)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
