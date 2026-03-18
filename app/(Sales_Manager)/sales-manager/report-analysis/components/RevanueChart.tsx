"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function RevenueChart() {

  const data = [
    { month: "Jan", revenue: 45000, orders: 32 },
    { month: "Feb", revenue: 52000, orders: 36 },
    { month: "Mar", revenue: 48000, orders: 34 },
    { month: "Apr", revenue: 61000, orders: 40 },
    { month: "May", revenue: 55000, orders: 38 },
    { month: "Jun", revenue: 68000, orders: 45 }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
        Revenue & Orders Trend
      </h3>

      {/* Chart */}
      <div className="w-full h-[300px]">

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>

            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
              </linearGradient>

              <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB"/>

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

            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "13px" }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366F1"
              fill="url(#revenue)"
              strokeWidth={3}
              name="Revenue ($)"
            />

            <Area
              type="monotone"
              dataKey="orders"
              stroke="#3B82F6"
              fill="url(#orders)"
              strokeWidth={3}
              name="Orders"
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}