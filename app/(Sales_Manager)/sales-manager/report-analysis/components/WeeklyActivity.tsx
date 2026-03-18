"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function WeeklyActivity() {

  const data = [
    { day: "Mon", quotations: 12, invoices: 8, dispatched: 6 },
    { day: "Tue", quotations: 15, invoices: 10, dispatched: 8 },
    { day: "Wed", quotations: 18, invoices: 12, dispatched: 10 },
    { day: "Thu", quotations: 14, invoices: 11, dispatched: 9 },
    { day: "Fri", quotations: 20, invoices: 15, dispatched: 12 },
    { day: "Sat", quotations: 8, invoices: 5, dispatched: 4 },
    { day: "Sun", quotations: 5, invoices: 3, dispatched: 2 }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
        Weekly Activity Trend
      </h3>

      {/* Chart */}
      <div className="w-full h-[300px]">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="day"
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

            {/* Quotations */}
            <Line
              type="monotone"
              dataKey="quotations"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Quotations"
            />

            {/* Invoices */}
            <Line
              type="monotone"
              dataKey="invoices"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Invoices"
            />

            {/* Dispatched */}
            <Line
              type="monotone"
              dataKey="dispatched"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Dispatched"
            />

          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}