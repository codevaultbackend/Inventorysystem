"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type PieItem = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: PieItem[];
};

const labelMap: Record<string, string> = {
  "0-180": "0-180: 27%",
  "181-365": "181-365: 15%",
  "366-730": "366-730: 11%",
  "731-1200": "731-1200: 8%",
  "730+": "730+: 47%",
};

export default function AgingDistributionChart({ data }: Props) {
  const topLeft = data.find((d) => d.name === "731-1200");
  const midLeft = data.find((d) => d.name === "366-730");
  const bottomLeft = data.find((d) => d.name === "181-365");
  const topRight = data.find((d) => d.name === "0-180");
  const bottomRight = data.find((d) => d.name === "730+");

  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-6 sm:pb-5">
      <div>
        <h3 className="text-[15px] font-[600] leading-[22px] text-[#101828] sm:text-[16px] sm:leading-[24px]">
          Aging Distribution
        </h3>
        <p className="text-[12px] font-[400] leading-[18px] text-[#98A2B3] sm:text-[13px]">
          Stock breakdown by age groups
        </p>
      </div>

      {/* Mobile / tablet */}
      <div className="mt-4 lg:hidden">
        <div className="mx-auto h-[220px] w-full max-w-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                startAngle={35}
                endAngle={-325}
                innerRadius={48}
                outerRadius={88}
                paddingAngle={5}
                stroke="#FFFFFF"
                strokeWidth={7}
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

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FCFCFD] px-3 py-2"
            >
              <span
                className="inline-block h-[10px] w-[10px] rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span
                className="text-[13px] font-[600]"
                style={{ color: item.color }}
              >
                {labelMap[item.name]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="mt-4 hidden min-h-[192px] grid-cols-[150px_1fr_126px] items-center gap-1 lg:grid">
        <div className="flex h-full flex-col justify-center gap-[34px]">
          <div className="flex items-center">
            <span
              className="whitespace-nowrap text-[14px] font-[600]"
              style={{ color: topLeft?.color }}
            >
              {labelMap["731-1200"]}
            </span>
            <div className="ml-3 h-0 w-full border-t border-dotted border-[#D0D5DD]" />
          </div>

          <div className="flex items-center">
            <span
              className="whitespace-nowrap text-[14px] font-[600]"
              style={{ color: midLeft?.color }}
            >
              {labelMap["366-730"]}
            </span>
            <div className="ml-3 h-0 w-full border-t border-dotted border-[#D0D5DD]" />
          </div>

          <div className="flex items-center">
            <span
              className="whitespace-nowrap text-[14px] font-[600]"
              style={{ color: bottomLeft?.color }}
            >
              {labelMap["181-365"]}
            </span>
            <div className="ml-3 h-0 w-full border-t border-dotted border-[#D0D5DD]" />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="h-[180px] w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  startAngle={35}
                  endAngle={-325}
                  innerRadius={44}
                  outerRadius={83}
                  paddingAngle={5}
                  stroke="#FFFFFF"
                  strokeWidth={7}
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
        </div>

        <div className="flex h-full flex-col justify-center gap-[88px]">
          <div className="flex items-center">
            <div className="mr-3 h-0 w-[78px] border-t border-dotted border-[#D0D5DD]" />
            <span
              className="whitespace-nowrap text-[14px] font-[600]"
              style={{ color: topRight?.color }}
            >
              {labelMap["0-180"]}
            </span>
          </div>

          <div className="flex items-center">
            <div className="mr-3 h-0 w-[78px] border-t border-dotted border-[#D0D5DD]" />
            <span
              className="whitespace-nowrap text-[14px] font-[600]"
              style={{ color: bottomRight?.color }}
            >
              {labelMap["730+"]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}