"use client";

import { useEffect, useMemo, useState } from "react";
import BranchOverviewPage, { DashboardIcons } from "./Component/BranchOverviewPage";
import { StockTrendBar } from "./Component/StockTrendBar";
import { SalesTrendLine } from "./Component/SalesTrendLine";
import HierarchyTable from "./Component/HierarchyTable";
import {
  salesDashboardApi,
  toNumber,
  formatCurrency,
  formatWeekLabel,
  formatNumber,
} from "@/app/lib/salesDashboardApi";

type DashboardPayload = {
  cards?: {
    totalRevenue: number | string;
    totalProfit: number | string;
    totalSales: number | string;
    totalBranches: number | string;
  };
  charts?: {
    salesTrend?: Array<{ week: string; sales: number | string; purchase: number | string }>;
    quotationTrend?: Array<{ week: string; pending: number | string; rejected: number | string }>;
  };
  states?: Array<{
    state: string;
    totalBranches: number | string;
    totalSales: number | string;
    totalRevenue: number | string;
    pendingQuotation: number | string;
  }>;
};

function SkeletonBlock({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-[12px] bg-[#E9EEF5] ${className}`}
      style={style}
    />
  );
}

function HeaderSkeleton() {
  return (
    <div className="px-1 py-1">
      <SkeletonBlock className="h-9 w-[240px] max-w-full" />
      <SkeletonBlock className="mt-2 h-4 w-[320px] max-w-full" />
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[22px] border border-[#E8EDF3] bg-white p-5 shadow-[0px_8px_24px_rgba(16,24,40,0.06)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-4 h-8 w-28" />
              <SkeletonBlock className="mt-4 h-4 w-20" />
            </div>
            <SkeletonBlock className="h-12 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({
  titleWidth = "w-40",
  subtitleWidth = "w-56",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#E8EDF3] bg-white p-4 sm:p-5 shadow-[0px_8px_24px_rgba(16,24,40,0.06)]">
      <SkeletonBlock className={`h-5 ${titleWidth}`} />
      <SkeletonBlock className={`mt-2 h-4 ${subtitleWidth}`} />

      <div className="mt-6 h-[300px] rounded-[18px] bg-[#F8FAFC] p-4">
        <div className="flex h-full items-end gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              className="w-full rounded-t-[10px]"
              style={{ height: `${32 + ((i % 4) + 1) * 12}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-[22px] border border-[#E8EDF3] bg-white p-4 sm:p-5 shadow-[0px_8px_24px_rgba(16,24,40,0.06)]">
      <SkeletonBlock className="h-5 w-36" />
      <SkeletonBlock className="mt-2 h-4 w-52" />

      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#EEF2F6]">
        <div className="grid grid-cols-5 gap-4 border-b border-[#EEF2F6] bg-white px-4 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-4 w-20" />
          ))}
        </div>

        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-5 gap-4 border-b border-[#EEF2F6] bg-white px-4 py-4 last:border-b-0"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
            <div className="flex justify-start">
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BranchOverviewDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await salesDashboardApi.get("/getstate");
        setData(res.data || {});
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: toNumber(data?.cards?.totalRevenue),
        icon: DashboardIcons.IndianRupee,
        type: "currency" as const,
      },
      {
        title: "Total Profit",
        value: toNumber(data?.cards?.totalProfit),
        icon: DashboardIcons.FileText,
      },
      {
        title: "Total Sales",
        value: toNumber(data?.cards?.totalSales),
        icon: DashboardIcons.TrendingUp,
        trend: "Day",
        trendType: "up" as const,
      },
      {
        title: "Total Branch",
        value: toNumber(data?.cards?.totalBranches),
        icon: DashboardIcons.BarChart3,
      },
    ],
    [data]
  );

  const salesTrendData = useMemo(() => {
    const rows = data?.charts?.salesTrend || [];
    return rows.map((row, index) => ({
      week: formatWeekLabel(row.week, index),
      stockIn: toNumber(row.sales),
      stockOut: toNumber(row.purchase),
    }));
  }, [data]);

  const quotationTrendData = useMemo(() => {
    const rows = data?.charts?.quotationTrend || [];
    return rows.map((row, index) => ({
      week: formatWeekLabel(row.week, index),
      pending: toNumber(row.pending),
      rejected: toNumber(row.rejected),
    }));
  }, [data]);

  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-6  pb-4 ">
      {loading ? (
        <>
          <HeaderSkeleton />
          <CardsSkeleton />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <ChartSkeleton titleWidth="w-44" subtitleWidth="w-60" />
            <ChartSkeleton titleWidth="w-36" subtitleWidth="w-52" />
          </div>

          <TableSkeleton />
        </>
      ) : (
        <>
          <div className="px-1 py-1">
            <h1 className="text-[30px] font-semibold leading-tight text-[#111827]">
              Branch Overview
            </h1>
            <p className="mt-1 text-[14px] text-[#98A2B3]">
              Detailed Branch Analytics and Sales Report
            </p>
          </div>

          <BranchOverviewPage cards={cards} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <StockTrendBar
              title="Top Saling Trendings Item"
              subtitle="Stay Ahead with Smart Sales Tracking"
              data={salesTrendData}
              firstLegend="Profit"
              secondLegend="Loss"
            />
            <SalesTrendLine
              title="Quatation Tracking"
              subtitle="Track pending & reject quatation"
              data={quotationTrendData}
            />
          </div>

          <HierarchyTable
            title="Branch Overview"
            subtitle="Latest System Activities and updates"
            data={data?.states || []}
            getViewHref={(row) =>
              `/sales-manager/Branches/${encodeURIComponent(String(row.state))}`
            }
            columns={[
              { key: "state", title: "Branch Name" },
              {
                key: "totalSales",
                title: "Total sales",
                render: (row) => formatNumber(toNumber(row.totalSales)),
              },
              {
                key: "totalRevenue",
                title: "Total Revenuee",
                render: (row) => formatCurrency(toNumber(row.totalRevenue)),
              },
              {
                key: "totalBranches",
                title: "No. of clients",
                render: (row) => formatNumber(toNumber(row.totalBranches)),
              },
              {
                key: "pendingQuotation",
                title: "Pending Quatation",
                render: (row) => formatNumber(toNumber(row.pendingQuotation)),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}