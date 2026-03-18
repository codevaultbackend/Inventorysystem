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
  category: string;
  approved: number;
  pending: number;
  rejected: number;
};

type Props = {
  data: Item[];
};

export default function PurchaseOrderTrendsChart({ data }: Props) {
  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-5 sm:pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[15px] font-[600] leading-[22px] text-[#101828] sm:text-[16px] sm:leading-[24px]">
            Purchase Order Trends
          </h3>
          <p className="text-[12px] font-[400] leading-[18px] text-[#667085] sm:text-[13px]">
            Insights into procurement patterns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-[13px] font-[500] text-[#667085] sm:text-[14px]">
            <span className="h-[8px] w-[8px] rounded-full bg-[#22C55E]" />
            Approved
          </div>
          <div className="flex items-center gap-2 text-[13px] font-[500] text-[#667085] sm:text-[14px]">
            <span className="h-[8px] w-[8px] rounded-full bg-[#FACC15]" />
            Pending
          </div>
          <div className="flex items-center gap-2 text-[13px] font-[500] text-[#667085] sm:text-[14px]">
            <span className="h-[8px] w-[8px] rounded-full bg-[#F87171]" />
            Rejected
          </div>
        </div>
      </div>

      <div className="mt-4 h-[250px] w-full sm:h-[290px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -14, bottom: 0 }}
            barCategoryGap="22%"
          >
            <CartesianGrid
              stroke="#E7EEF7"
              strokeDasharray="3 5"
              vertical={false}
            />

            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fontSize: 11, fill: "#667085", fontWeight: 500 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              ticks={[0, 250, 500, 750, 1000]}
              tick={{ fontSize: 11, fill: "#667085", fontWeight: 500 }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #EAECF0",
                boxShadow:
                  "0px 1px 2px rgba(16,24,40,0.04), 0px 4px 10px rgba(16,24,40,0.08)",
                fontSize: "12px",
              }}
            />

            <Bar
              dataKey="rejected"
              fill="#F87171"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="pending"
              fill="#FACC15"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="approved"
              fill="#22C55E"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}