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

type ScrapChartItem = {
  name: string;
  repairable: number;
  scrap: number;
};

type Props = {
  data?: ScrapChartItem[];
  loading?: boolean;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <p className="mb-2 text-[12px] font-semibold text-[#0F172A]">{label}</p>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
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

export default function ScrapRepairChart({
  data = [],
  loading = false,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A]">
        Scrap & Repairable Stock
      </h3>
      <p className="mb-4 text-[12px] text-[#64748B]">
        Track scrap and repairable goods by category
      </p>

      {loading ? (
        <div className="h-[260px] animate-pulse rounded-2xl bg-[#F8FAFC] sm:h-[280px]" />
      ) : data.length > 0 ? (
        <div className="h-[260px] min-w-0 sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#E8EEF5" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="repairable" fill="#FACC15" radius={[6, 6, 0, 0]} />
              <Bar dataKey="scrap" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[260px] items-center justify-center rounded-2xl bg-[#F8FAFC] text-sm text-[#64748B] sm:h-[280px]">
          No scrap and repairable data found
        </div>
      )}
    </div>
  );
}