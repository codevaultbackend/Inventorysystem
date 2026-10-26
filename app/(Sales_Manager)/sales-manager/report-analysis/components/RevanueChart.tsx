"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type RevenueTrendItem = {
  month: string;
  revenue: number;
  orders: number;
};

type Props = {
  data: RevenueTrendItem[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function RevenueChart({ data }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
        Revenue & Orders Trend
      </h3>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

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

            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "Revenue (₹)") return [formatCurrency(Number(value)), name];
                return [value, name];
              }}
            />

            <Legend iconType="circle" wrapperStyle={{ fontSize: "13px" }} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366F1"
              fill="url(#revenue)"
              strokeWidth={3}
              name="Revenue (₹)"
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