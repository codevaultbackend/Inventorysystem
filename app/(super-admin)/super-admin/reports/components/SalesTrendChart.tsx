"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type TrendChartItem = {
  name: string;
  repairable: number;
  scrap: number;
};

type Props = {
  data?: TrendChartItem[];
  loading?: boolean;
};

function formatCompactNumber(value: number) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <p className="mb-2 text-[12px] font-semibold text-[#0F172A]">{label}</p>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
          <span className="text-[12px] text-[#475569]">Repairable</span>
          <span className="text-[12px] font-semibold text-[#0F172A]">
            {Number(payload[0]?.payload?.repairable || 0).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
          <span className="text-[12px] text-[#475569]">Scrap</span>
          <span className="text-[12px] font-semibold text-[#0F172A]">
            {Number(payload[0]?.payload?.scrap || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SalesTrendChart({
  data = [],
  loading = false,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A]">
        Scrap & Repairable Trends by Branch
      </h3>
      <p className="mb-4 text-[12px] text-[#64748B]">
        Compare repairable and scrap stock across branches
      </p>

      {loading ? (
        <div className="h-[280px] animate-pulse rounded-2xl bg-[#F8FAFC] sm:h-[320px]" />
      ) : data.length > 0 ? (
        <div className="h-[280px] min-w-0 sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="repairable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="scrap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#E8EEF5" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickFormatter={(value) => formatCompactNumber(Number(value))}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="repairable"
                stroke="#22C55E"
                strokeWidth={2.5}
                fill="url(#repairable)"
              />
              <Area
                type="monotone"
                dataKey="scrap"
                stroke="#EF4444"
                strokeWidth={2.5}
                fill="url(#scrap)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center rounded-2xl bg-[#F8FAFC] text-sm text-[#64748B] sm:h-[320px]">
          No trend data found
        </div>
      )}
    </div>
  );
}