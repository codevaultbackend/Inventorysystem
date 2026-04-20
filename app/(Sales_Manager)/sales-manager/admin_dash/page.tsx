"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BranchOverviewCounts from "../Branches/Component/BranchOverviewPage";
import { StockTrendBar } from "../Branches/Component/StockTrendBar";
import { SalesTrendLine } from "../Branches/Component/SalesTrendLine";
import InventoryItems from "../Branches/Component/InventoryItems";
import { useAuth } from "../../../context/AuthContext";
import { getBranchDashboard } from "../../../lib/salesHierarchy";
import { toNumber } from "../../../lib/salesDashboardApi";

type ProductRow = {
  productName: string;
  category: string;
  totalSales: number;
  totalRevenue: number;
  clients: number;
  pendingQuotation: number;
  rejectedQuotation: number;
};

type BranchDashboardData = {
  metrics: Array<{
    title: string;
    value: number;
    trend?: string;
    trendType?: "up" | "down";
  }>;
  stockTrend: Array<{
    week: string;
    stockIn: number;
    stockOut: number;
  }>;
  quotationTrend: Array<{
    week: string;
    pending: number;
    rejected: number;
  }>;
  products: ProductRow[];
};

type InventoryRow = {
  id: string;
  itemName: string;
  name: string;
  category: string;
  quantity: number;
  stock: number;
  stockIn: number;
  stockOut: number;
  status: string;
  href: string;
};

function getUserBranchId(user: any): string {
  if (!user) return "";

  if (user?.branch_id !== undefined && user?.branch_id !== null) {
    return String(user.branch_id);
  }

  if (user?.branchId !== undefined && user?.branchId !== null) {
    return String(user.branchId);
  }

  if (user?.branch?.id !== undefined && user?.branch?.id !== null) {
    return String(user.branch.id);
  }

  if (Array.isArray(user?.branches) && user.branches.length > 0) {
    const first = user.branches[0];

    if (typeof first === "string" || typeof first === "number") {
      return String(first);
    }

    if (first?.id !== undefined && first?.id !== null) {
      return String(first.id);
    }

    if (first?.branch_id !== undefined && first?.branch_id !== null) {
      return String(first.branch_id);
    }

    if (first?.branchId !== undefined && first?.branchId !== null) {
      return String(first.branchId);
    }
  }

  return "";
}

function SkeletonBlock({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#E9EEF5] ${className}`}
      style={style}
    />
  );
}

function HeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
      <SkeletonBlock className="h-8 w-[220px] max-w-full" />
      <SkeletonBlock className="mt-3 h-4 w-[320px] max-w-full" />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#EEF2F6] bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-8 w-28" />
            <SkeletonBlock className="mt-4 h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none">
      <SkeletonBlock className="h-5 w-40" />
      <div className="mt-6 flex h-[320px] items-end gap-3 rounded-2xl bg-[#F8FAFC] p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className="w-full rounded-t-xl"
            style={{ height: `${35 + ((i % 4) + 1) * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none">
      <SkeletonBlock className="mb-4 h-5 w-32" />

      <div className="overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white">
        <div className="grid grid-cols-5 gap-4 border-b border-[#EEF2F6] px-4 py-4 max-[900px]:grid-cols-3">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-20 max-[900px]:hidden" />
          <SkeletonBlock className="h-4 w-20 max-[900px]:hidden" />
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 max-[900px]:grid-cols-3"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-4 w-16 max-[900px]:hidden" />
            <SkeletonBlock className="h-8 w-20 rounded-full max-[900px]:hidden" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, branchName: authBranchName, stateName: authStateName } = useAuth();

  const [data, setData] = useState<BranchDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const branchId = useMemo(() => getUserBranchId(user), [user]);

  const fetchBranchDashboard = useCallback(async () => {
    if (!user) return;

    if (!branchId) {
      setError("Branch ID not found in logged in user");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getBranchDashboard(branchId);
      setData(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load branch details"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user, branchId]);

  useEffect(() => {
    if (!user) return;
    fetchBranchDashboard();
  }, [user, fetchBranchDashboard]);

  const statsData = useMemo(() => {
    return {
      totalStock: 0,
      totalStockValue: 0,
      totalSales: toNumber(data?.metrics?.[0]?.value),
      agingItems: 0,
    };
  }, [data]);

  const stockStatusData = useMemo(() => {
    return {
      good: 0,
      damaged: 0,
      repairable: 0,
    };
  }, []);

  const branchSummary = useMemo(() => {
    return {
      totalBranches: 1,
      activeBranches: 1,
      inactiveBranches: 0,
    };
  }, []);

  const stockTrendData = useMemo(() => {
    const rows = Array.isArray(data?.stockTrend) ? data.stockTrend : [];

    return rows.map((row, index) => ({
      week: row?.week || `Week ${index + 1}`,
      in: toNumber(row?.stockIn),
      out: toNumber(row?.stockOut),
    }));
  }, [data]);

  const salesTrendData = useMemo(() => {
    const rows = Array.isArray(data?.quotationTrend) ? data.quotationTrend : [];

    return rows.map((row, index) => ({
      week: row?.week || `Week ${index + 1}`,
      purchase: toNumber(row?.rejected),
      sales: toNumber(row?.pending),
    }));
  }, [data]);

  const itemRows: InventoryRow[] = useMemo(() => {
    const products = Array.isArray(data?.products) ? data.products : [];

    return products.map((item, index) => ({
      id: String(index + 1),
      itemName: item?.productName || "-",
      name: item?.productName || "-",
      category: item?.category || "General",
      quantity: toNumber(item?.totalSales),
      stock: toNumber(item?.totalSales),
      stockIn: toNumber(item?.pendingQuotation),
      stockOut: toNumber(item?.rejectedQuotation),
      status: "GOOD",
      href: `/admin/all-stocks`,
    }));
  }, [data]);

  const branchDisplayName = authBranchName || "My Branch";
  const stateDisplayName = authStateName || "";

  if (!user) {
    return (
      <div className="space-y-8">
        <HeaderSkeleton />
        <OverviewSkeleton />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (!branchId && !loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="rounded-2xl border border-[#EEF2F6] bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Branch not found
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Logged in branch information is missing.
          </p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
        <h3 className="text-[16px] font-semibold text-[#B42318]">
          Unable to load branch dashboard
        </h3>
        <p className="mt-2 text-[14px] text-[#7A271A]">{error}</p>

        <button
          type="button"
          onClick={fetchBranchDashboard}
          className="mt-4 inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#B42318] px-4 text-[14px] font-medium text-white transition hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loading ? (
        <>
          <HeaderSkeleton />
          <OverviewSkeleton />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <TableSkeleton />
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h1 className="text-[24px] font-semibold text-[#0F172A] md:text-[28px]">
              {branchDisplayName}
            </h1>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Detailed branch analytics and inventory overview
              {stateDisplayName ? ` • ${stateDisplayName}` : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none">
            <BranchOverviewCounts
              stats={statsData}
              stockStatus={stockStatusData}
              branchSummary={branchSummary}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none">
              <StockTrendBar data={stockTrendData} />
            </div>

            <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none">
              <SalesTrendLine data={salesTrendData} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none">
            <h3 className="mb-4 text-[16px] font-semibold text-[#0F172A]">
              Inventory Items
            </h3>

            <InventoryItems
              data={itemRows}
              branchId={String(branchId)}
              state={stateDisplayName}
            />
          </div>
        </>
      )}
    </div>
  );
}