"use client";

import { useEffect, useMemo, useState } from "react";
import BranchOverviewCounts from "../Branches/Component/BranchOverviewPage";
import { StockTrendBar } from "../Branches/Component/StockTrendBar";
import { SalesTrendLine } from "../Branches/Component/SalesTrendLine";
import InventoryItems from "../Branches/Component/InventoryItems";
import { combineApi, toNumber } from "../../../lib/combineDashboardApi";
import { useAuth } from "../../../context/AuthContext";

type BranchApiResponse = {
  branchUsed?: number;
  branchInfo?: {
    id?: number | string;
    name?: string;
    code?: string;
    state?: string;
    type?: string;
    status?: string;
    location?: string;
    contact_number?: string;
    email?: string;
  };
  stats?: {
    totalStock?: number | string;
    totalValue?: number | string;
    totalSales?: number | string;
    agingItems?: number | string;
  };
  charts?: {
    stockMovement?: Array<{
      week?: string;
      stockIn?: number | string;
      stockOut?: number | string;
    }>;
    salesTrend?: Array<{
      week?: string;
      stockIn?: number | string;
      stockOut?: number | string;
    }>;
  };
  stocks?: Array<{
    id?: number | string;
    item?: string;
    category?: string;
    quantity?: number | string;
    current_stock?: number | string;
    stock_in?: number | string;
    stock_out?: number | string;
    status?: string;
    value?: number | string;
    aging?: number | string;
    branch_id?: number | string;
  }>;
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

  if (Array.isArray(user?.branches) && user.branches.length > 0) {
    return String(user.branches[0] ?? "");
  }

  if (user?.branch_id !== undefined && user?.branch_id !== null) {
    return String(user.branch_id);
  }

  if (user?.branchId !== undefined && user?.branchId !== null) {
    return String(user.branchId);
  }

  return "";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
        <div className="h-8 w-[260px] rounded-lg bg-[#E9EEF5]" />
        <div className="mt-3 h-4 w-[320px] max-w-full rounded-lg bg-[#EEF2F6]" />
      </div>

      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-[0] max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-[0]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#EEF2F6] bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 rounded-md bg-[#EEF2F6]" />
              <div className="mt-4 h-8 w-28 rounded-md bg-[#E9EEF5]" />
              <div className="mt-4 h-3 w-20 rounded-md bg-[#F1F5F9]" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-[0] max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-[0]"
          >
            <div className="rounded-2xl border border-[#EEF2F6] bg-white p-5">
              <div className="h-5 w-40 rounded-md bg-[#E9EEF5]" />
              <div className="mt-6 h-[260px] w-full rounded-2xl bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF2F6_100%)]" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-[0] max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-[0]">
        <div className="mb-4 h-5 w-32 rounded-md bg-[#E9EEF5]" />

        <div className="overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white">
          <div className="grid grid-cols-5 gap-4 border-b border-[#EEF2F6] px-4 py-4 max-[768px]:grid-cols-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-4 rounded-md bg-[#EEF2F6] max-[768px]:last:hidden"
              />
            ))}
          </div>

          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="grid grid-cols-5 gap-4 border-b border-[#F5F7FA] px-4 py-4 last:border-b-0 max-[768px]:grid-cols-2"
            >
              {[1, 2, 3, 4, 5].map((col) => (
                <div
                  key={col}
                  className="h-4 rounded-md bg-[#F1F5F9] max-[768px]:last:hidden"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const {
    user,
    branchName: authBranchName,
    stateName: authStateName,
  } = useAuth();

  const branchId = getUserBranchId(user);

  const [data, setData] = useState<BranchApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranchDashboard = async () => {
      if (!branchId) {
        setError("Branch ID not found in logged in user");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await combineApi.get(
          `/sqlbranch/branch/${encodeURIComponent(branchId)}`
        );

        const payload = (res?.data || {}) as BranchApiResponse;
        setData(payload);
      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 403) {
          setError("You are not authorized to view this branch.");
        } else if (status === 404) {
          setError("Branch details endpoint was not found.");
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load branch details"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBranchDashboard();
  }, [branchId]);

  const statsData = useMemo(() => {
    return {
      totalStock: toNumber(data?.stats?.totalStock),
      totalStockValue: toNumber(data?.stats?.totalValue),
      totalSales: toNumber(data?.stats?.totalSales),
      agingItems: toNumber(data?.stats?.agingItems),
    };
  }, [data]);

  const stockStatusData = useMemo(() => {
    const stocks = Array.isArray(data?.stocks) ? data?.stocks : [];

    const good = stocks.filter(
      (item) => String(item?.status || "").toUpperCase() === "GOOD"
    ).length;

    const damaged = stocks.filter(
      (item) => String(item?.status || "").toUpperCase() === "DAMAGED"
    ).length;

    const repairable = stocks.filter(
      (item) => String(item?.status || "").toUpperCase() === "REPAIRABLE"
    ).length;

    return { good, damaged, repairable };
  }, [data]);

  const branchSummary = useMemo(() => {
    const status = String(data?.branchInfo?.status || "").toUpperCase();

    return {
      totalBranches: 1,
      activeBranches: status === "ACTIVE" ? 1 : 0,
      inactiveBranches: status === "ACTIVE" ? 0 : 1,
    };
  }, [data]);

  const stockTrendData = useMemo(() => {
    const rows = Array.isArray(data?.charts?.stockMovement)
      ? data?.charts?.stockMovement
      : [];

    return rows.map((row, index) => ({
      week: row?.week || `Week ${index + 1}`,
      in: toNumber(row?.stockIn),
      out: toNumber(row?.stockOut),
    }));
  }, [data]);

  const salesTrendData = useMemo(() => {
    const rows = Array.isArray(data?.charts?.salesTrend)
      ? data?.charts?.salesTrend
      : [];

    return rows.map((row, index) => ({
      week: row?.week || `Week ${index + 1}`,
      purchase: toNumber(row?.stockOut),
      sales: toNumber(row?.stockIn),
    }));
  }, [data]);

  const itemRows: InventoryRow[] = useMemo(() => {
    const stocks = Array.isArray(data?.stocks) ? data?.stocks : [];

    return stocks.map((item) => ({
      id: String(item?.id ?? ""),
      itemName: item?.item || "-",
      name: item?.item || "-",
      category: item?.category || "General",
      quantity: toNumber(item?.quantity ?? item?.current_stock),
      stock: toNumber(item?.quantity ?? item?.current_stock),
      stockIn: toNumber(item?.stock_in),
      stockOut: toNumber(item?.stock_out),
      status: item?.status || "-",
      href: `/admin/all-stocks`,
    }));
  }, [data]);

  const branchDisplayName =
    data?.branchInfo?.name || authBranchName || "My Branch";

  const stateDisplayName =
    data?.branchInfo?.state || authStateName || "";

  if (!branchId) {
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
        <h1 className="text-[24px] font-semibold text-[#0F172A] md:text-[28px]">
          {branchDisplayName}
        </h1>
        <p className="mt-1 text-[13px] text-[#64748B]">
          Detailed branch analytics and inventory overview
          {stateDisplayName ? ` • ${stateDisplayName}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-[0] max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-[0]">
        <BranchOverviewCounts
          stats={statsData}
          stockStatus={stockStatusData}
          branchSummary={branchSummary}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-[0] max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-[0]">
          <StockTrendBar data={stockTrendData} />
        </div>

        <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-[0] max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-[0]">
          <SalesTrendLine data={salesTrendData} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm max-[768px]:border-[0] max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-[0]">
        <h3 className="mb-4 text-[16px] font-semibold text-[#0F172A]">
          Inventory Items
        </h3>

        <InventoryItems
          data={itemRows}
          branchId={String(branchId)}
          state={stateDisplayName}
        />
      </div>
    </div>
  );
}