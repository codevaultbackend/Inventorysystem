"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BranchOverviewPage, { DashboardIcons } from "../../../Component/BranchOverviewPage";
import { StockTrendBar } from "../../../Component/StockTrendBar";
import { SalesTrendLine } from "../../../Component/SalesTrendLine";
import AgingAnalysis from "./component/AgingAnylysis";
import { salesDashboardApi, toNumber, formatWeekLabel } from "@/app/lib/salesDashboardApi";

type ItemPayload = {
  item?: string;
  category?: string;
  cards?: {
    totalQty: number | string;
    stockValue: number | string;
    totalRevenue: number | string;
    totalInvoices: number | string;
  };
  charts?: {
    stockTrend?: Array<{ week: string; sales: number | string; purchase: number | string }>;
    revenueTrend?: Array<{ week: string; revenue: number | string; cost: number | string }>;
  };
  table?: Array<{
    date: string;
    aging?: string;
    invoiceNumber: string;
    clientName: string;
    branch: string;
    qty: number | string;
    rate: number | string;
    amount: number | string;
    status: string;
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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="px-1 py-1">
        <SkeletonBlock className="h-9 w-[260px] max-w-full" />
        <SkeletonBlock className="mt-2 h-4 w-[300px] max-w-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[42px] w-[92px] rounded-xl" />
        ))}
      </div>
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
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-4 h-8 w-24" />
              <SkeletonBlock className="mt-4 h-4 w-16" />
            </div>
            <SkeletonBlock className="h-12 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({
  titleWidth = "w-44",
  subtitleWidth = "w-52",
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
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className="mt-2 h-4 w-52" />

      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#EEF2F6]">
        <div className="grid grid-cols-8 gap-4 border-b border-[#EEF2F6] bg-white px-4 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-4 w-16" />
          ))}
        </div>

        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-8 gap-4 border-b border-[#EEF2F6] bg-white px-4 py-4 last:border-b-0"
          >
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-12" />
            <SkeletonBlock className="h-4 w-12" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ItemAnalyzePage() {
  const params = useParams();
  const itemId = decodeURIComponent((params?.itemId as string) || "");

  const [active, setActive] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [data, setData] = useState<ItemPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItemDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await salesDashboardApi.get(`/dashboard/item/${encodeURIComponent(itemId)}`);
        setData(res.data || {});
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load item dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (itemId) fetchItemDashboard();
  }, [itemId]);

  const cards = useMemo(
    () => [
      {
        title: "Total Quantity Sold",
        value: toNumber(data?.cards?.totalQty),
        icon: DashboardIcons.ShoppingCart,
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Available Stock Value",
        value: toNumber(data?.cards?.stockValue),
        icon: DashboardIcons.BarChart3,
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Revenue",
        value: toNumber(data?.cards?.totalRevenue),
        icon: DashboardIcons.IndianRupee,
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Invoice",
        value: toNumber(data?.cards?.totalInvoices),
        icon: DashboardIcons.FileText,
        trend: "+12.5%",
        trendType: "up" as const,
      },
    ],
    [data]
  );

  const stockMovementData = useMemo(() => {
    const rows = data?.charts?.stockTrend || [];
    return rows.map((row, index) => ({
      week: formatWeekLabel(row.week, index),
      stockIn: toNumber(row.sales),
      stockOut: toNumber(row.purchase),
    }));
  }, [data, active]);

  const revenueTrendData = useMemo(() => {
    const rows = data?.charts?.revenueTrend || [];
    return rows.map((row, index) => ({
      week: formatWeekLabel(row.week, index),
      pending: toNumber(row.revenue),
      rejected: toNumber(row.cost),
    }));
  }, [data, active]);

  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-6 px-2 pb-4 sm:px-3 lg:px-4">
      {loading ? (
        <>
          <HeaderSkeleton />
          <CardsSkeleton />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <ChartSkeleton titleWidth="w-44" subtitleWidth="w-56" />
            <ChartSkeleton titleWidth="w-40" subtitleWidth="w-52" />
          </div>

          <TableSkeleton />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="px-1 py-1">
              <h1 className="text-[30px] font-semibold leading-tight text-[#111827]">
                {data?.item || "Item Analysis"}
                {data?.category ? ` , ${data.category}` : ""}
              </h1>
              <p className="mt-1 text-[14px] text-[#98A2B3]">
                Comprehensive item analysis and tracking
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["Daily", "Weekly", "Monthly"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setActive(item)}
                  className={`rounded-xl px-4 py-2 text-[14px] font-semibold transition ${
                    active === item
                      ? "bg-[#0D63C8] text-white shadow-sm"
                      : "border border-[#E5EAF0] bg-white text-[#6B7280]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <BranchOverviewPage cards={cards} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <StockTrendBar
              title="Stock IN & OUT Movement"
              subtitle="Track sales and purchase trends"
              data={stockMovementData}
              firstLegend="Sales"
              secondLegend="Purchase"
            />
            <SalesTrendLine
              title="Revenue & Cost Trends"
              subtitle="Track sales and purchase trends"
              data={revenueTrendData}
              firstLegend="Revenue"
              secondLegend="Cost"
              currency
            />
          </div>

          <AgingAnalysis data={data?.table || []} />
        </>
      )}
    </div>
  );
}