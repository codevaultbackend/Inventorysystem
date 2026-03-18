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

type Item = {
  name: string;
  blue: number;
  green: number;
  yellow: number;
  red: number;
};

type Props = {
  data: Item[];
};

export default function AgingCategoryBarChart({ data }: Props) {
  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-6 sm:pb-5">
      <div>
        <h3 className="text-[15px] font-[600] leading-[22px] text-[#101828] sm:text-[16px] sm:leading-[24px]">
          Aging by Category
        </h3>
        <p className="text-[12px] font-[400] leading-[18px] text-[#98A2B3] sm:text-[13px]">
          Track sales and purchase trends
        </p>
      </div>

      <div className="mt-3 w-full overflow-x-auto">
        <div className="h-[220px] min-w-[560px] w-full sm:h-[230px] lg:min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              barGap={5}
              barCategoryGap="34%"
            >
              <CartesianGrid
                stroke="#E7EEF7"
                strokeDasharray="3 5"
                vertical
                horizontal
              />

              <XAxis
                dataKey="name"
                interval={0}
                axisLine={false}
                tickLine={false}
                height={36}
                tick={{
                  fontSize: 11,
                  fill: "#98A2B3",
                  fontWeight: 500,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                ticks={[0, 500, 1000, 1500, 2000]}
                tick={{
                  fontSize: 11,
                  fill: "#667085",
                  fontWeight: 500,
                }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #EAECF0",
                  boxShadow:
                    "0px 1px 2px rgba(16,24,40,0.04), 0px 4px 10px rgba(16,24,40,0.08)",
                  fontSize: "12px",
                }}
              />

              <Bar
                dataKey="blue"
                fill="#2F80ED"
                radius={[999, 999, 999, 999]}
                barSize={10}
              />
              <Bar
                dataKey="green"
                fill="#18B277"
                radius={[999, 999, 999, 999]}
                barSize={10}
              />
              <Bar
                dataKey="yellow"
                fill="#F59E0B"
                radius={[999, 999, 999, 999]}
                barSize={10}
              />
              <Bar
                dataKey="red"
                fill="#EF4444"
                radius={[999, 999, 999, 999]}
                barSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}