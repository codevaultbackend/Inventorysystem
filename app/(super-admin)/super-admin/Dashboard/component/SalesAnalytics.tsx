"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";

type SalesChartItem = {
  day: string;
  fullDate?: string;
  sales: number;
  purchase: number;
};

type Props = {
  data?: SalesChartItem[];
  loading?: boolean;
};

type FilterType = "weekly" | "monthly" | "yearly";

function formatAxis(value: number) {
  if (value <= 0) return "0";
  if (value >= 100000) return `${Math.round(value / 1000)}k`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const salesValue = payload.find((p: any) => p.dataKey === "sales")?.value ?? 0;
  const purchaseValue =
    payload.find((p: any) => p.dataKey === "purchase")?.value ?? 0;

  return (
    <div className="rounded-[18px] border border-[#E8EDF3] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
      <p className="mb-3 text-[14px] font-semibold text-[#222222]">{label}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="h-[12px] w-[12px] rounded-full bg-[#6B6BFF]" />
          <span className="text-[#6B7280]">Sales</span>
          <span className="font-semibold text-[#111827]">
            ₹{Number(salesValue).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[13px]">
          <span className="h-[12px] w-[12px] rounded-full bg-[#EA4AAA]" />
          <span className="text-[#6B7280]">Purchase</span>
          <span className="font-semibold text-[#111827]">
            ₹{Number(purchaseValue).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SalesAnalytics({ data = [], loading = false }: Props) {
  const [filter, setFilter] = useState<FilterType>("weekly");

  const filteredData = useMemo(() => {
    if (filter === "weekly") return data.slice(-7);
    if (filter === "monthly") return data.slice(-30);
    return data.slice(-12);
  }, [data, filter]);

  const maxValue = useMemo(() => {
    const max = Math.max(
      ...filteredData.map((item) => Math.max(item.sales, item.purchase)),
      0
    );

    if (max <= 0) return 100000;
    return Math.ceil(max * 1.18);
  }, [filteredData]);

  return (
    <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#E8EDF3] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.08),0_1px_2px_rgba(16,24,40,0.04)] sm:px-6 sm:py-5 xl:h-[280px]">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#171717]">
            Sales &amp; Purchase Analytics
          </h3>
          <p className="mt-1 text-[13px] leading-[18px] text-[#9AA0AA]">
            Track sales and purchase trends
          </p>
        </div>

        <div className="relative w-fit shrink-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="h-9 appearance-none rounded-[10px] border border-transparent bg-white pr-7 text-[14px] font-medium text-[#666666] outline-none"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8B8B]" />
        </div>
      </div>

      {loading ? (
        <div className="h-[190px] animate-pulse rounded-[16px] bg-[#F7FAFC]" />
      ) : filteredData.length > 0 ? (
        <div className="h-[190px] w-full sm:h-[200px] xl:h-[195px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 12, right: 6, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#E8EEF5"
                strokeDasharray="4 4"
                vertical
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8B949E", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fill: "#8B949E", fontSize: 12 }}
                tickFormatter={(value) => formatAxis(Number(value))}
                domain={[0, maxValue]}
                tickCount={5}
              />
              <Tooltip
                cursor={{ stroke: "#D6DFEB", strokeDasharray: "4 4" }}
                content={<CustomTooltip />}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#6B6BFF"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "#6B6BFF",
                  stroke: "#FFFFFF",
                }}
              />
              <Line
                type="monotone"
                dataKey="purchase"
                stroke="#EA4AAA"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "#EA4AAA",
                  stroke: "#FFFFFF",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[190px] items-center justify-center rounded-[16px] border border-dashed border-[#E5EAF1] bg-[#FAFCFE] text-sm text-[#8A94A6]">
          No analytics data available
        </div>
      )}
    </section>
  );
}