"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartItem = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  subtitle?: string;
  data: ChartItem[];
  height?: number;
};

export default function StockMovementChart({
  title,
  subtitle,
  data,
  height = 320,
}: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-[16px] font-semibold text-gray-800">{title}</h3>
        {subtitle && (
          <p className="text-[13px] text-gray-500">{subtitle}</p>
        )}
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="label" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}