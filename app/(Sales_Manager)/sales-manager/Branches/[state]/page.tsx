"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BranchOverviewPage, { DashboardIcons } from "../Component/BranchOverviewPage";
import { StockTrendBar } from "../Component/StockTrendBar";
import { SalesTrendLine } from "../Component/SalesTrendLine";
import HierarchyTable from "../Component/HierarchyTable";
import {
  salesDashboardApi,
  toNumber,
  formatCurrency,
  formatWeekLabel,
  formatNumber,
} from "@/app/lib/salesDashboardApi";

type BranchPayload = {
  cards?: {
    totalSales: number | string;
    pendingQuotation: number | string;
    salesThisMonth: number | string;
    totalClients: number | string;
  };
  charts?: {
    stockTrend?: Array<{ week: string; stockIn: number | string; stockOut: number | string }>;
    quotationTrend?: Array<{ week: string; pending: number | string; rejected: number | string }>;
  };
  products?: Array<{
    productName: string;
    category: string;
    totalSales: number | string;
    totalRevenue: number | string;
    clients: number | string;
    pendingQuotation: number | string;
    rejectedQuotation: number | string;
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
      <SkeletonBlock className="h-9 w-[220px] max-w-full" />
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
        <div className="grid grid-cols-7 gap-4 border-b border-[#EEF2F6] bg-white px-4 py-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-4 w-20" />
          ))}
        </div>

        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-7 gap-4 border-b border-[#EEF2F6] bg-white px-4 py-4 last:border-b-0"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BranchDetailsPage() {
  const params = useParams();
  const branchId = decodeURIComponent((params?.branchId as string) || "");

  const [data, setData] = useState<BranchPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await salesDashboardApi.get(`/sales/branch/${encodeURIComponent(branchId)}`);
        setData(res.data || {});
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load branch dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (branchId) fetchBranchDashboard();
  }, [branchId]);

  const cards = useMemo(
    () => [
      {
        title: "Total Sales",
        value: toNumber(data?.cards?.totalSales),
        icon: DashboardIcons.ShoppingCart,
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Pending Quatation",
        value: toNumber(data?.cards?.pendingQuotation),
        icon: DashboardIcons.FileText,
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Sales This Months",
        value: toNumber(data?.cards?.salesThisMonth),
        icon: DashboardIcons.TrendingUp,
        trend: "+12.5%",
        trendType: "down" as const,
      },
      {
        title: "Total Client",
        value: toNumber(data?.cards?.totalClients),
        icon: DashboardIcons.Users,
      },
    ],
    [data]
  );

  const stockTrendData = useMemo(() => {
    const rows = data?.charts?.stockTrend || [];
    return rows.map((row, index) => ({
      week: formatWeekLabel(row.week, index),
      stockIn: toNumber(row.stockIn),
      stockOut: toNumber(row.stockOut),
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
    <div className="space-y-6 px-2 pb-4 sm:px-3 lg:px-4">
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
            <h1 className="text-[30px] font-semibold leading-tight text-[#111827]">{branchId}</h1>
            <p className="mt-1 text-[14px] text-[#98A2B3]">
              Detailed branch analytics and inventory
            </p>
          </div>

          <BranchOverviewPage cards={cards} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <StockTrendBar
              title="Pending & Rejected Quation"
              subtitle="Track sales and purchase trends"
              data={stockTrendData}
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
            data={data?.products || []}
            getViewHref={() => null}
            columns={[
              { key: "productName", title: "Product Name" },
              { key: "category", title: "Categoriees Name" },
              {
                key: "totalSales",
                title: "Total Sales",
                render: (row) => formatNumber(toNumber(row.totalSales)),
              },
              {
                key: "totalRevenue",
                title: "Total Revenuee",
                render: (row) => formatCurrency(toNumber(row.totalRevenue)),
              },
              {
                key: "clients",
                title: "No. of Clients",
                render: (row) => formatNumber(toNumber(row.clients)),
              },
              {
                key: "pendingQuotation",
                title: "Pending Quatation",
                render: (row) => formatNumber(toNumber(row.pendingQuotation)),
              },
              {
                key: "rejectedQuotation",
                title: "Rejection Quatation",
                render: (row) => formatNumber(toNumber(row.rejectedQuotation)),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}