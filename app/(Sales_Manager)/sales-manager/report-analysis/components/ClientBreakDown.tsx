"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

type Props = {
  data: {
    newClients: number;
    returningClients: number;
  };
};

export default function ClientBreakDown({ data }: Props) {
  const total = data.newClients + data.returningClients;

  const chartData = [
    { name: "New Clients", value: data.newClients, color: "#6366F1" },
    { name: "Returning Clients", value: data.returningClients, color: "#10B981" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">
          Client Breakdown
        </h3>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-8 p-6 flex-1">
        <div className="w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                cx="50%"
                cy="50%"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4 text-sm w-full max-w-[220px]">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 font-medium">{item.name}</span>
              </div>

              <span className="text-gray-900 font-semibold">
                {total > 0 ? `${Math.round((item.value / total) * 100)}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}