"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BranchOverviewPage from "../../../Component/BranchOverviewPage";
import { SalesTrendLine } from "../../../Component/SalesTrendLine";
import { StockTrendBar } from "../../../Component/StockTrendBar";
import AgingAnylysis from "./component/AgingAnylysis";
import {
  combineApi,
  toNumber,
} from "../../../../../../lib/combineDashboardApi";

type ItemApiResponse = {
  success?: boolean;
  item?: string;
  branchId?: string;
  stats?: {
    totalStock?: string | number;
    totalValue?: string | number;
    entries?: string | number;
    stockIn?: string | number;
    stockOut?: string | number;
    purchaseQty?: string | number;
    purchaseValue?: string | number;
    salesQty?: string | number;
    salesValue?: string | number;
  };
  charts?: {
    agingChart?: any[];
    statusChart?: any[];
    monthlyTrend?: Array<{
      month?: string;
      amount?: string | number;
      stockIn?: string | number;
      stockOut?: string | number;
      purchase?: string | number;
      sales?: string | number;
    }>;
  };
  batches?: any[];
};

type BranchApiResponse = {
  success?: boolean;
  branch?: {
    id?: string | number;
    name?: string;
  };
  charts?: {
    monthlyTrend?: Array<{
      month?: string;
      amount?: string | number;
      stockIn?: string | number;
      stockOut?: string | number;
      purchase?: string | number;
      sales?: string | number;
    }>;
  };
};

function HeaderSkeleton() {
  return (
    <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:mb-5 sm:p-5 animate-pulse">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="h-7 w-52 rounded-md bg-[#E9EEF5] sm:h-8" />
          <div className="mt-3 h-4 w-40 rounded-md bg-[#E9EEF5]" />
          <div className="mt-2 h-4 w-56 rounded-md bg-[#E9EEF5]" />
        </div>

        <div className="w-full lg:w-auto">
          <div className="flex w-full flex-wrap gap-2 lg:justify-end">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 flex-1 rounded-xl bg-[#E9EEF5] sm:w-[90px] sm:flex-none"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[24px] border border-[#E6EDF5] bg-white p-5 shadow-sm"
        >
          <div className="h-4 w-24 rounded bg-[#E9EEF5]" />
          <div className="mt-4 h-8 w-28 rounded bg-[#E9EEF5]" />
          <div className="mt-3 h-3 w-20 rounded bg-[#E9EEF5]" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm animate-pulse">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="h-5 w-36 rounded bg-[#E9EEF5]" />
        <div className="h-8 w-20 rounded-xl bg-[#E9EEF5]" />
      </div>

      <div className="flex h-[260px] items-end gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-end justify-center">
            <div
              className="w-full rounded-t-xl bg-[#E9EEF5]"
              style={{ height: `${40 + (i % 5) * 30}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AgingSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm animate-pulse">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="h-5 w-40 rounded bg-[#E9EEF5]" />
        <div className="h-8 w-24 rounded-xl bg-[#E9EEF5]" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#EEF2F6] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 w-32 rounded bg-[#E9EEF5]" />
              <div className="h-4 w-14 rounded bg-[#E9EEF5]" />
            </div>
            <div className="mt-3 h-3 w-full rounded bg-[#E9EEF5]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ItemAnalyzePage() {
  const params = useParams();

  const stateName = decodeURIComponent((params?.state as string) || "");
  const branchId = decodeURIComponent((params?.branchId as string) || "");
  const itemId = decodeURIComponent((params?.itemId as string) || "");

  const [active, setActive] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [itemData, setItemData] = useState<ItemApiResponse | null>(null);
  const [branchData, setBranchData] = useState<BranchApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const [itemRes, branchRes] = await Promise.all([
          combineApi.get(
            `/combine/dashboard/item/${encodeURIComponent(
              branchId
            )}/${encodeURIComponent(itemId)}`
          ),
          combineApi.get(
            `/combine/dashboard/branch-id/${encodeURIComponent(branchId)}`
          ),
        ]);

        setItemData(itemRes?.data || null);
        setBranchData(branchRes?.data?.data || branchRes?.data || null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || "Failed to load item"
        );
      } finally {
        setLoading(false);
      }
    };

    if (branchId && itemId) {
      fetchItem();
    }
  }, [branchId, itemId]);

  const statsData = useMemo(() => {
    const stats = itemData?.stats;

    return {
      totalStock: toNumber(stats?.totalStock),
      totalStockValue: toNumber(stats?.totalValue),
      totalSales: toNumber(stats?.salesValue ?? stats?.stockOut),
      agingItems: Array.isArray(itemData?.charts?.agingChart)
        ? itemData!.charts!.agingChart!.length
        : 0,
    };
  }, [itemData]);

  const stockStatusData = useMemo(() => {
    const statusChart = itemData?.charts?.statusChart || [];

    const getValue = (keys: string[]) => {
      const found = statusChart.find((row: any) =>
        keys.includes(
          String(row?.status || row?.name || row?.label || "").toUpperCase()
        )
      );
      return toNumber(found?.count ?? found?.value ?? found?.total);
    };

    return {
      good: getValue(["GOOD"]),
      damaged: getValue(["DAMAGED"]),
      repairable: getValue(["REPAIRABLE"]),
    };
  }, [itemData]);

  const branchSummary = useMemo(() => {
    return {
      totalBranches: 1,
      activeBranches: 1,
      inactiveBranches: 0,
    };
  }, []);

  const chartSource = useMemo(() => {
    const itemMonthly = itemData?.charts?.monthlyTrend || [];
    const branchMonthly = branchData?.charts?.monthlyTrend || [];

    return itemMonthly.length ? itemMonthly : branchMonthly;
  }, [itemData, branchData]);

  const filteredTrendData = useMemo(() => {
    const rows = chartSource || [];

    if (!Array.isArray(rows)) return [];

    return rows.map((row: any, index: number) => {
      const label = row?.month || row?.week || row?.date || `${active} ${index + 1}`;

      return {
        week: label,
        in: toNumber(row?.stockIn ?? row?.purchase ?? row?.amount),
        out: toNumber(row?.stockOut ?? row?.sales ?? 0),
        purchase: toNumber(row?.purchase ?? row?.amount ?? 0),
        sales: toNumber(row?.sales ?? row?.stockOut ?? 0),
      };
    });
  }, [chartSource, active]);

  const stockTrendData = useMemo(() => {
    return filteredTrendData.map((row) => ({
      week: row.week,
      in: row.in,
      out: row.out,
    }));
  }, [filteredTrendData]);

  const salesTrendData = useMemo(() => {
    return filteredTrendData.map((row) => ({
      week: row.week,
      purchase: row.purchase,
      sales: row.sales,
    }));
  }, [filteredTrendData]);

  const agingData = useMemo(() => {
    return Array.isArray(itemData?.charts?.agingChart)
      ? itemData?.charts?.agingChart
      : [];
  }, [itemData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1600px] min-w-0">
          <HeaderSkeleton />

          <div className="min-w-0">
            <OverviewSkeleton />
          </div>

          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-2 lg:gap-5">
            <div className="min-w-0 overflow-hidden rounded-2xl">
              <ChartSkeleton />
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl">
              <ChartSkeleton />
            </div>
          </div>

          <div className="mt-4 min-w-0 overflow-hidden rounded-2xl lg:mt-5">
            <AgingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] px-4 py-5 sm:px-5 lg:px-6">
        <div className="rounded-2xl bg-white p-4 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1600px] min-w-0">
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:mb-5 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl">
                {itemData?.item || itemId || "Item Analysis"}
              </h1>

              <div className="mt-1 space-y-1">
                <p className="truncate text-sm text-gray-500">
                  State: {stateName || "N/A"}
                </p>
                <p className="truncate text-sm text-gray-500">
                  Branch: {branchData?.branch?.name || branchId || "N/A"}
                </p>
              </div>
            </div>

            
          </div>
        </div>

        <div className="min-w-0">
          <BranchOverviewPage
            stats={statsData}
            stockStatus={stockStatusData}
            branchSummary={branchSummary}
          />
        </div>

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-2 lg:gap-5">
          <div className="min-w-0 overflow-hidden rounded-2xl">
            <SalesTrendLine data={salesTrendData} />
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl">
            <StockTrendBar data={stockTrendData} />
          </div>
        </div>

        <div className="mt-4 min-w-0 overflow-hidden rounded-2xl lg:mt-5">
          <AgingAnylysis data={agingData} />
        </div>
      </div>
    </div>
  );
}