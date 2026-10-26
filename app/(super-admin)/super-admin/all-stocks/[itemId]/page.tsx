"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BranchOverviewPage from "../../Branches/Component/BranchOverviewPage";
import { SalesTrendLine } from "../../Branches/Component/SalesTrendLine";
import { StockTrendBar } from "../../Branches/Component/StockTrendBar";
import AgingAnylysis from "./component/AgingAnylysis";
import { combineApi, toNumber } from "../../../../lib/combineDashboardApi";
import { useAuth } from "../../../../context/AuthContext";

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
      week?: string;
      date?: string;
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
      week?: string;
      date?: string;
      amount?: string | number;
      stockIn?: string | number;
      stockOut?: string | number;
      purchase?: string | number;
      sales?: string | number;
    }>;
  };
};

function getResolvedBranchId(user: any, fallbackBranchId?: string | null) {
  if (fallbackBranchId) return String(fallbackBranchId);

  if (!user) return "";

  if (user?.branch_id !== undefined && user?.branch_id !== null) {
    return String(user.branch_id);
  }

  if (user?.branchId !== undefined && user?.branchId !== null) {
    return String(user.branchId);
  }

  if (Array.isArray(user?.branches) && user.branches.length > 0) {
    return String(user.branches[0] ?? "");
  }

  if (Array.isArray(user?.user?.branches) && user.user.branches.length > 0) {
    return String(user.user.branches[0] ?? "");
  }

  if (user?.user?.branch_id !== undefined && user?.user?.branch_id !== null) {
    return String(user.user.branch_id);
  }

  if (user?.user?.branchId !== undefined && user?.user?.branchId !== null) {
    return String(user.user.branchId);
  }

  return "";
}

function ItemAnalysisSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] px-2 sm:px-2 lg:px-3">
      <div className="mx-auto w-full max-w-[1600px] min-w-0 animate-pulse">
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:mb-5 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="h-7 w-[220px] max-w-full rounded-lg bg-[#E9EEF5]" />
              <div className="mt-3 h-4 w-[160px] rounded-md bg-[#EEF2F6]" />
              <div className="mt-2 h-4 w-[190px] rounded-md bg-[#F1F5F9]" />
            </div>

            <div className="w-full lg:w-auto">
              <div className="flex w-full flex-wrap gap-2 lg:justify-end">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-10 flex-1 rounded-xl bg-[#EEF2F6] sm:w-[90px] sm:flex-none"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#EEF2F6] bg-white p-5"
              >
                <div className="h-4 w-24 rounded-md bg-[#EEF2F6]" />
                <div className="mt-4 h-8 w-28 rounded-md bg-[#E9EEF5]" />
                <div className="mt-4 h-3 w-20 rounded-md bg-[#F1F5F9]" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-2 lg:gap-5">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="h-5 w-36 rounded-md bg-[#E9EEF5]" />
              <div className="mt-6 h-[280px] w-full rounded-2xl bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF2F6_100%)]" />
            </div>
          ))}
        </div>

        <div className="mt-4 min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-sm lg:mt-5 sm:p-5">
          <div className="h-5 w-40 rounded-md bg-[#E9EEF5]" />
          <div className="mt-6 h-[320px] w-full rounded-2xl bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF2F6_100%)]" />
        </div>
      </div>
    </div>
  );
}

export default function ItemAnalyzePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const itemId = decodeURIComponent((params?.itemId as string) || "");

  const queryBranchId =
    searchParams.get("branchId") ||
    searchParams.get("branch_id") ||
    searchParams.get("id") ||
    "";

  const branchId = getResolvedBranchId(user, queryBranchId);

  const [active, setActive] = useState<"Daily" | "Weekly" | "Monthly">(
    "Weekly"
  );
  const [itemData, setItemData] = useState<ItemApiResponse | null>(null);
  const [branchData, setBranchData] = useState<BranchApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      if (!branchId || !itemId) return;

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

    if (!authLoading) {
      if (!branchId) {
        setError("Branch ID not found in auth context");
        setLoading(false);
        return;
      }

      if (!itemId) {
        setError("Item ID not found in route");
        setLoading(false);
        return;
      }

      fetchItem();
    }
  }, [authLoading, branchId, itemId]);

  const statsData = useMemo(() => {
    const stats = itemData?.stats;

    return {
      totalStock: toNumber(stats?.totalStock),
      totalStockValue: toNumber(stats?.totalValue),
      totalSales: toNumber(stats?.salesValue ?? stats?.stockOut),
      agingItems: Array.isArray(itemData?.charts?.agingChart)
        ? itemData.charts.agingChart.length
        : 0,
    };
  }, [itemData]);

  const stockStatusData = useMemo(() => {
    const statusChart = Array.isArray(itemData?.charts?.statusChart)
      ? itemData.charts.statusChart
      : [];

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
    const itemMonthly = Array.isArray(itemData?.charts?.monthlyTrend)
      ? itemData.charts.monthlyTrend
      : [];

    const branchMonthly = Array.isArray(branchData?.charts?.monthlyTrend)
      ? branchData.charts.monthlyTrend
      : [];

    return itemMonthly.length ? itemMonthly : branchMonthly;
  }, [itemData, branchData]);

  const filteredTrendData = useMemo(() => {
    if (!Array.isArray(chartSource)) return [];

    return chartSource.map((row: any, index: number) => {
      const label =
        row?.month || row?.week || row?.date || `${active} ${index + 1}`;

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
      ? itemData.charts.agingChart
      : [];
  }, [itemData]);

  if (authLoading || loading) {
    return <ItemAnalysisSkeleton />;
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
    <div className="min-h-screen bg-[#F7F9FB] px-2 sm:px-2 lg:px-3">
      <div className="mx-auto w-full max-w-[1600px] min-w-0">
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:mb-5 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl">
                {itemData?.item || itemId || "Item Analysis"}
              </h1>

              <div className="mt-1 space-y-1">
                <p className="truncate text-sm text-gray-500">
                  Branch ID: {branchId || "N/A"}
                </p>
                <p className="truncate text-sm text-gray-500">
                  Branch: {branchData?.branch?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="w-full lg:w-auto">
              <div className="flex w-full flex-wrap gap-2 lg:justify-end">
                {["Daily", "Weekly", "Monthly"].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setActive(item as "Daily" | "Weekly" | "Monthly")
                    }
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition sm:flex-none sm:px-4 ${
                      active === item
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
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