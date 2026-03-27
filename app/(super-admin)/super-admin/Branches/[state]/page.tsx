"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BranchoverwiewPage from "../Component/BranchOverviewPage";
import BranchOverview from "../../Dashboard/component/BranchOverview";
import { SalesTrendLine } from "../Component/SalesTrendLine";
import { StockTrendBar } from "../Component/StockTrendBar";
import { combineApi, toNumber } from "../../../../lib/combineDashboardApi";

type BranchApiRow = {
  branchId?: number | string;
  id?: number | string;
  branchName?: string;
  name?: string;
  totalBranches?: number | string;
  totalStock?: number | string;
  totalValue?: number | string;
  currentStock?: number | string;
  stockIn?: number | string;
  stockOut?: number | string;
  purchaseCount?: number | string;
  salesCount?: number | string;
};

type StateDashboardPayload = {
  success?: boolean;
  message?: string;
  branches?: BranchApiRow[];
  summary?: {
    currentStock?: number | string;
    totalStockValue?: number | string;
    totalBranches?: number | string;
    totalSales?: number | string;
    agingItems?: number | string;
  };
  charts?: {
    branchValueChart?: Array<{
      label?: string;
      value?: number | string;
    }>;
  };
};

function HeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm p-6 animate-pulse">
      <div className="h-8 w-52 rounded-md bg-[#E9EEF5]" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-md bg-[#E9EEF5]" />
    </div>
  );
}

function OverviewCardsSkeleton() {
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
    <div className="rounded-[24px] border border-[#E6EDF5] bg-white p-5 shadow-sm animate-pulse">
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

function BranchOverviewSkeleton() {
  return (
    <div className="w-full rounded-[24px] border border-[#E6EDF5] bg-white p-4 sm:p-5 lg:p-6 shadow-sm animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-7 w-44 rounded-md bg-[#E9EEF5]" />
          <div className="h-10 w-28 rounded-xl bg-[#E9EEF5]" />
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[#EEF2F6]">
          <div className="min-w-full">
            <div className="grid grid-cols-7 gap-3 border-b border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-[#E9EEF5]" />
              ))}
            </div>

            <div className="divide-y divide-[#EEF2F6]">
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-7 gap-3 px-4 py-5"
                >
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="h-4 rounded bg-[#E9EEF5]"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatePage() {
  const params = useParams();
  const stateName = decodeURIComponent((params?.state as string) || "");

  const [branches, setBranches] = useState<BranchApiRow[]>([]);
  const [summary, setSummary] = useState<StateDashboardPayload["summary"] | null>(null);
  const [charts, setCharts] = useState<StateDashboardPayload["charts"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emptyReason, setEmptyReason] = useState("");

  useEffect(() => {
    const fetchStateDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setEmptyReason("");

        const res = await combineApi.get(
          `/combine/dashboard/state/${encodeURIComponent(stateName)}`
        );

        const payload: StateDashboardPayload = res?.data?.data || res?.data || {};

        const branchRows = Array.isArray(payload.branches) ? payload.branches : [];
        setBranches(branchRows);
        setSummary(payload.summary || null);
        setCharts(payload.charts || null);

        if (!branchRows.length && !payload.summary) {
          setEmptyReason(
            payload.message || `No dashboard data is available for ${stateName}.`
          );
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            `Failed to load ${stateName}`
        );
      } finally {
        setLoading(false);
      }
    };

    if (stateName) fetchStateDetails();
  }, [stateName]);

  const statsData = useMemo(() => {
    return {
      totalStock:
        toNumber(summary?.currentStock) ||
        branches.reduce(
          (sum, row) => sum + toNumber(row.currentStock ?? row.totalStock),
          0
        ),
      totalStockValue:
        toNumber(summary?.totalStockValue) ||
        branches.reduce((sum, row) => sum + toNumber(row.totalValue), 0),
      totalSales:
        toNumber(summary?.totalSales) ||
        branches.reduce((sum, row) => sum + toNumber(row.salesCount), 0),
      agingItems: toNumber(summary?.agingItems),
    };
  }, [summary, branches]);

  const stockStatusData = useMemo(() => {
    return {
      good:
        toNumber(summary?.currentStock) ||
        branches.reduce(
          (sum, row) => sum + toNumber(row.currentStock ?? row.totalStock),
          0
        ),
      damaged: 0,
      repairable: 0,
    };
  }, [summary, branches]);

  const branchSummary = useMemo(() => {
    const totalBranches = toNumber(summary?.totalBranches) || branches.length;
    return {
      totalBranches,
      activeBranches: totalBranches,
      inactiveBranches: 0,
    };
  }, [summary, branches]);

  const stockTrendData = useMemo(() => {
    const chart = charts?.branchValueChart || [];

    if (chart.length > 0) {
      return chart.map((item) => ({
        week: item.label || "-",
        in: toNumber(item.value),
        out: 0,
      }));
    }

    return branches.map((row, index) => ({
      week: row.branchName || row.name || `Branch ${index + 1}`,
      in: toNumber(row.currentStock ?? row.totalStock),
      out: toNumber(row.stockOut),
    }));
  }, [charts, branches]);

  const salesTrendData = useMemo(() => {
    return branches.map((row, index) => ({
      week: row.branchName || row.name || `Branch ${index + 1}`,
      purchase: toNumber(row.purchaseCount),
      sales: toNumber(row.salesCount),
    }));
  }, [branches]);

  const tableData = useMemo(() => {
    return branches.map((row, index) => {
      const branchId = String(row.branchId ?? row.id ?? index + 1);
      const branchName = row.branchName || row.name || `Branch ${index + 1}`;

      return {
        id: branchId,
        name: branchName,
        stock: toNumber(row.totalStock ?? row.currentStock),
        purchase: toNumber(row.purchaseCount),
        sales: toNumber(row.salesCount),
        in: toNumber(row.stockIn),
        out: toNumber(row.stockOut),
        href: `/super-admin/Branches/${encodeURIComponent(stateName)}/${encodeURIComponent(branchId)}`,
      };
    });
  }, [branches, stateName]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6 mb-[16px]">
      {loading ? (
        <>
          <HeaderSkeleton />

          <OverviewCardsSkeleton />

          <div className="grid xl:grid-cols-2 sm:grid-cols-1 max-[768px]:grid-cols-1 justify-between gap-[16px]">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>

          <div className="flex xl:grid-cols-2 sm:grid-cols-1 justify-between gap-[16px]">
            <BranchOverviewSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm p-6">
            <h1 className="text-[24px] md:text-[28px] font-semibold text-[#0F172A]">
              {stateName}
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1">
              State level dashboard and branch analytics
            </p>
          </div>

          {!tableData.length && emptyReason ? (
            <div className="bg-white rounded-2xl border border-[#FDE68A] shadow-sm p-6">
              <h3 className="text-[18px] font-semibold text-[#92400E]">
                No data available
              </h3>
              <p className="text-sm text-[#78350F] mt-2">{emptyReason}</p>
            </div>
          ) : null}

          <BranchoverwiewPage
            stats={statsData}
            stockStatus={stockStatusData}
            branchSummary={branchSummary}
          />

          <div className="grid xl:grid-cols-2 sm:grid-cols-1 max-[768px]:grid-cols-1 justify-between gap-[16px]">
            <StockTrendBar data={stockTrendData} />
            <SalesTrendLine data={salesTrendData} />
          </div>

          <div className="flex xl:grid-cols-2 sm:grid-cols-1 justify-between gap-[16px]">
            <BranchOverview data={tableData} />
          </div>
        </>
      )}
    </div>
  );
}