"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type WeeklyItem = {
  day: string;
  quotations: number;
  approved: number;
  invoices: number;
};

type Props = {
  data: WeeklyItem[];
};

export default function WeeklyActivity({ data }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
        Weekly Activity Trend
      </h3>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

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

            <Legend iconType="circle" wrapperStyle={{ fontSize: "13px" }} />

            <Line
              type="monotone"
              dataKey="quotations"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Quotations"
            />

            <Line
              type="monotone"
              dataKey="approved"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Approved"
            />

            <Line
              type="monotone"
              dataKey="invoices"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Invoices"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}