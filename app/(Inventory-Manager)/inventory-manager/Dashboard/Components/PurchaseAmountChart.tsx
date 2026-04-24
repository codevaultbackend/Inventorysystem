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

export default function PurchaseAmountChart({ data }: any) {

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

 
  const maxValue = Math.max(...data.map((d: any) => d.amount || 0), 1000);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[18px] font-semibold text-gray-800 sm:text-base lg:text-lg">
          Purchase Amount Over Time
        </h2>

        
      </div>

      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 6, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="purchaseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.06} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <YAxis
              domain={[0, maxValue]} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />

            <Tooltip
              formatter={(value: number) => [
                `₹${value.toLocaleString()}`,
                "Amount",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="amount" 
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#purchaseFill)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}