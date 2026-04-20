"use client";

import { useEffect, useMemo, useState } from "react";
import BranchoverwiewPage from "./Component/BranchOverviewPage";
import BranchOverview from "../Dashboard/component/BranchOverview";
import { SalesTrendLine } from "./Component/SalesTrendLine";
import { StockTrendBar } from "./Component/StockTrendBar";
import { combineApi, toNumber } from "../../../lib/combineDashboardApi";

type StateApiRow = {
  state?: string;
  totalBranches?: number | string;
  totalStock?: number | string;
  totalValue?: number | string;
  currentStock?: number | string;
  purchaseCount?: number | string;
  salesCount?: number | string;
};

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

export default function Branches() {
  const [states, setStates] = useState<StateApiRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await combineApi.get("/combine/dashboard/states");
        const payload = res?.data?.data || res?.data || {};

        setStates(Array.isArray(payload.states) ? payload.states : []);
        setSummary(payload.summary || null);
        setCharts(payload.charts || null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || "Failed to load states"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  const statsData = useMemo(() => {
    return {
      totalStock:
        toNumber(summary?.currentStock) ||
        states.reduce(
          (sum, row) => sum + toNumber(row.currentStock ?? row.totalStock),
          0
        ),
      totalStockValue:
        toNumber(summary?.totalStockValue) ||
        states.reduce((sum, row) => sum + toNumber(row.totalValue), 0),
      totalSales: states.reduce((sum, row) => sum + toNumber(row.salesCount), 0),
      agingItems: 0,
    };
  }, [summary, states]);

  const stockStatusData = useMemo(() => {
    return {
      good: toNumber(summary?.currentStock),
      damaged: 0,
      repairable: 0,
    };
  }, [summary]);

  const branchSummary = useMemo(() => {
    const totalBranches = states.reduce(
      (sum, row) => sum + toNumber(row.totalBranches),
      0
    );

    return {
      totalBranches,
      activeBranches: totalBranches,
      inactiveBranches: 0,
    };
  }, [states]);

  const stockTrendData = useMemo(() => {
    const chart = charts?.stateValueChart || [];
    return chart.map((item: any) => ({
      week: item.label || "-",
      in: toNumber(item.value),
      out: 0,
    }));
  }, [charts]);

  const salesTrendData = useMemo(() => {
    return states.map((row) => ({
      week: row.state || "-",
      purchase: toNumber(row.purchaseCount),
      sales: toNumber(row.salesCount),
    }));
  }, [states]);

  const tableData = useMemo(() => {
    return states.map((row, index) => ({
      id: String(index + 1),
      name: row.state || "-",
      stock: toNumber(row.totalStock),
      purchase: toNumber(row.purchaseCount),
      sales: toNumber(row.salesCount),
      in: toNumber(row.currentStock),
      out: 0,
      href: `/super-admin/Branches/${encodeURIComponent(row.state || "")}`,
    }));
  }, [states]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6 mb-[16px]">
      <div className="w-full">
        {loading ? (
          <BranchOverviewSkeleton />
        ) : (
          <BranchOverview data={tableData} />
        )}
      </div>
    </div>
  );
}