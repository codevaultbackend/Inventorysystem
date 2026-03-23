"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

function formatCompactNumber(value: number) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return `${value}`;
}

function formatAxis(value: number) {
  if (value === 0) return "0";
  if (value >= 10000000) return `${(value / 10000000).toFixed(0)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(0)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return `${value}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const salesValue = payload.find((p) => p.dataKey === "sales")?.value ?? 0;
  const purchaseValue =
    payload.find((p) => p.dataKey === "purchase")?.value ?? 0;

  return (
    <div className="rounded-[16px] border border-[#E5EAF1] bg-white px-4 py-3 shadow-[0px_14px_28px_rgba(15,23,42,0.10)]">
      <p className="mb-2 text-[12px] font-semibold text-[#111827]">{label}</p>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#60A5FA]" />
          <span className="text-[12px] text-[#6B7280]">Sales</span>
          <span className="text-[12px] font-semibold text-[#111827]">
            ₹ {Number(salesValue).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EC4899]" />
          <span className="text-[12px] text-[#6B7280]">Purchase</span>
          <span className="text-[12px] font-semibold text-[#111827]">
            ₹ {Number(purchaseValue).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SalesAnalytics({
  data = [],
  loading = false,
}: Props) {
  const [filter, setFilter] = useState<FilterType>("weekly");

  const filteredData = useMemo(() => {
    if (filter === "weekly") return data.slice(-7);
    if (filter === "monthly") return data.slice(-30);
    return data.slice(-12);
  }, [data, filter]);

  const totalSales = useMemo(() => {
    return data.reduce((sum, item) => sum + Number(item.sales || 0), 0);
  }, [data]);

  const totalPurchase = useMemo(() => {
    return data.reduce((sum, item) => sum + Number(item.purchase || 0), 0);
  }, [data]);

  const maxValue = useMemo(() => {
    const max = Math.max(
      ...filteredData.map((item) => Math.max(item.sales, item.purchase)),
      0
    );

    if (max <= 0) return 100;
    return Math.ceil(max * 1.2);
  }, [filteredData]);

  return (
    <div className=" lg:max-h-[322px] min-w-0 overflow-hidden rounded-[22px] border border-[#E6EDF5] bg-white px-5 py-5  sm:px-6 sm:py-6 shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
            Sales & Purchase Trends
          </h3>
          <p className="mt-1 text-[13px] text-[#8A94A6]">
            Track sales and purchase trends
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          
          <div className="relative w-fit">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="
                h-10 appearance-none rounded-[12px] border border-[#E5EAF1]
                bg-white pl-4 pr-10 text-[14px] font-medium text-[#6B7280]
                outline-none transition focus:border-[#CBD5E1]
              "
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] animate-pulse rounded-[18px] bg-[#F7FAFC]" />
      ) : filteredData.length > 0 ? (
        <div className="h-[320px] w-full sm:h-[340px] xl:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#E8EEF5"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={54}
                domain={[0, maxValue]}
                tickCount={5}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                tickFormatter={(value) => formatAxis(Number(value))}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#DCE4EE", strokeDasharray: "4 4" }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#60A5FA"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: "#60A5FA",
                  strokeWidth: 2,
                  fill: "#FFFFFF",
                }}
              />
              <Line
                type="monotone"
                dataKey="purchase"
                stroke="#EC4899"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: "#EC4899",
                  strokeWidth: 2,
                  fill: "#FFFFFF",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-[18px] border border-dashed border-[#E5EAF1] bg-[#FAFCFE]">
          <p className="text-sm text-[#8A94A6]">No analytics data available</p>
        </div>
      )}
    </div>
  );
}