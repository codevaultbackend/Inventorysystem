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
      totalSales:
        states.reduce((sum, row) => sum + toNumber(row.salesCount), 0),
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6 mb-[16px]">
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
    </div>
  );
}