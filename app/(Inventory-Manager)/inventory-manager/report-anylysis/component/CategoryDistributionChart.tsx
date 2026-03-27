"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Item = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: Item[];
};

export default function CategoryDistributionChart({ data }: Props) {
  const firstItem = data[0];

  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-5 sm:pb-5">
      <div>
        <h3 className="text-[15px] font-[600] leading-[22px] text-[#101828] sm:text-[16px] sm:leading-[24px]">
          Category Distribution
        </h3>
        <p className="text-[12px] font-[400] leading-[18px] text-[#667085] sm:text-[13px]">
          Inventory breakdown by category
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_150px] lg:items-center">
        <div className="relative flex items-center justify-center">
          <div className="h-[220px] w-full max-w-[320px] sm:h-[240px] sm:max-w-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={100}
                  startAngle={355}
                  endAngle={-5}
                  paddingAngle={6}
                  stroke="#FFFFFF"
                  strokeWidth={8}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke={entry.color}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {firstItem && (
            <div className="absolute right-[8%] top-[8%] rounded-[10px] border border-[#D0D5DD] bg-white px-3 py-2 text-[12px] font-[600] text-[#344054] shadow-[0px_1px_2px_rgba(16,24,40,0.06)] sm:text-[14px]">
              {firstItem.name} : {firstItem.value}
            </div>
          )}
        </div>

        <div className="space-y-[6px] lg:pl-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 text-[13px] font-[500] leading-[20px] sm:text-[14px]"
              style={{ color: item.color }}
            >
              <span
                className="inline-block h-[8px] w-[8px] rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}