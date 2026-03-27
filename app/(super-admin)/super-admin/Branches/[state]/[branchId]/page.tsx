"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BranchOverviewCounts from "../../Component/BranchOverviewPage";
import { StockTrendBar } from "../../Component/StockTrendBar";
import { SalesTrendLine } from "../../Component/SalesTrendLine";
import InventoryItems from "../../Component/InventoryItems";
import { combineApi, toNumber } from "../../../../../lib/combineDashboardApi";

type BranchDetailsPayload = {
  success?: boolean;
  message?: string;
  branch?: {
    id?: number | string;
    name?: string;
    state?: string;
  };
  summary?: {
    totalStockValue?: number | string;
    currentStock?: number | string;
    totalItems?: number | string;
    stockIn?: number | string;
    stockOut?: number | string;
    purchaseStockQty?: number | string;
    purchaseStockValue?: number | string;
    salesStockQty?: number | string;
    salesStockValue?: number | string;
  };
  charts?: {
    categoryDistribution?: Array<{ category: string; total: number | string }>;
    monthlyTrend?: Array<{ month: string; amount: number | string }>;
  };
  clients?: any[];
  topItems?: Array<{
    id?: number | string;
    item?: string;
    totalQty?: number | string;
    totalValue?: number | string;
    category?: string;
    status?: string;
  }>;
};

type InventoryApiItem = {
  id: number | string;
  item: string;
  category: string;
  current_stock: number | string;
  stock_in: number | string;
  stock_out: number | string;
  branch_id: number | string;
  status?: string;
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

const INVENTORY_ENDPOINTS = [
  "/stock/inventory/dashboard",
  "/combine/dashboard/inventory",
  "/inventory/dashboard",
];

function HeaderSkeleton() {
  return (
    <div className="bg-white border border-[#EEF2F6] rounded-2xl shadow-sm p-6 animate-pulse">
      <div className="h-8 w-56 rounded-md bg-[#E9EEF5]" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-md bg-[#E9EEF5]" />
    </div>
  );
}

function OverviewCardsSkeleton() {
  return (
    <div className="bg-white border border-[#EEF2F6] max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 rounded-2xl shadow-sm p-6">
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
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white border border-[#EEF2F6] max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 rounded-2xl shadow-sm p-6 animate-pulse">
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

function InventoryItemsSkeleton() {
  return (
    <div className="bg-white border border-[#EEF2F6] max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 rounded-2xl shadow-sm p-6 animate-pulse">
      <div className="h-5 w-32 rounded bg-[#E9EEF5] mb-4" />

      <div className="overflow-hidden rounded-[20px] border border-[#EEF2F6] bg-white">
        <div className="grid grid-cols-7 gap-3 border-b border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-[#E9EEF5]" />
          ))}
        </div>

        <div className="divide-y divide-[#EEF2F6]">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7 gap-3 px-4 py-5">
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 rounded bg-[#E9EEF5]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BranchDetailsPage() {
  const params = useParams();
  const stateName = decodeURIComponent((params?.state as string) || "");
  const branchId = decodeURIComponent((params?.branchId as string) || "");

  const [data, setData] = useState<BranchDetailsPayload | null>(null);
  const [inventory, setInventory] = useState<InventoryApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inventoryReason, setInventoryReason] = useState("");

  useEffect(() => {
    if (!stateName || !branchId) return;

    const makeFallbackRowsFromTopItems = (
      payload: BranchDetailsPayload
    ): InventoryApiItem[] => {
      const topItems = Array.isArray(payload?.topItems) ? payload.topItems : [];

      return topItems.map((item, index) => ({
        id: item.id ?? `top-${index + 1}`,
        item: item.item || `Item ${index + 1}`,
        category: item.category || "General",
        current_stock: item.totalQty ?? 0,
        stock_in: 0,
        stock_out: 0,
        branch_id: branchId,
        status: item.status || "GOOD",
      }));
    };

    const extractRows = (payload: any): any[] => {
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.inventory)) return payload.inventory;
      if (Array.isArray(payload)) return payload;
      return [];
    };

    const fetchInventory = async (
      branchPayload: BranchDetailsPayload
    ): Promise<{
      rows: InventoryApiItem[];
      reason: string;
    }> => {
      for (const endpoint of INVENTORY_ENDPOINTS) {
        try {
          const res = await combineApi.get(endpoint);
          const payload = res?.data?.data || res?.data || {};
          const rows = extractRows(payload);

          if (!rows.length) continue;

          const filtered = rows.filter(
            (item: any) => String(item?.branch_id) === String(branchId)
          );

          if (filtered.length) {
            return {
              rows: filtered,
              reason: "",
            };
          }
        } catch (err: any) {
          const status = err?.response?.status;

          if (status === 403 || status === 404) {
            continue;
          }

          if (err?.code === "ECONNABORTED" || err?.message === "Network Error") {
            continue;
          }

          return {
            rows: makeFallbackRowsFromTopItems(branchPayload),
            reason:
              "Inventory API could not be loaded, so fallback item data is being shown.",
          };
        }
      }

      const fallbackRows = makeFallbackRowsFromTopItems(branchPayload);

      if (fallbackRows.length) {
        return {
          rows: fallbackRows,
          reason:
            "Inventory endpoint is unavailable or restricted for this role, so fallback item data is being shown.",
        };
      }

      return {
        rows: [],
        reason:
          "Inventory endpoint is unavailable or restricted for this role.",
      };
    };

    const fetchBranchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setInventoryReason("");

        const branchRes = await combineApi.get(
          `/combine/dashboard/branch-id/${encodeURIComponent(branchId)}`
        );

        const branchPayload: BranchDetailsPayload =
          branchRes?.data?.data || branchRes?.data || {};

        const inventoryResult = await fetchInventory(branchPayload);

        setData(branchPayload);
        setInventory(inventoryResult.rows);
        setInventoryReason(inventoryResult.reason);
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

    fetchBranchDetails();
  }, [stateName, branchId]);

  const statsData = useMemo(() => {
    return {
      totalStock: toNumber(data?.summary?.currentStock),
      totalStockValue: toNumber(data?.summary?.totalStockValue),
      totalSales: toNumber(data?.summary?.salesStockQty),
      agingItems: 0,
    };
  }, [data]);

  const stockStatusData = useMemo(() => {
    const good = inventory.filter(
      (item) => String(item.status || "").toUpperCase() === "GOOD"
    ).length;

    const damaged = inventory.filter(
      (item) => String(item.status || "").toUpperCase() === "DAMAGED"
    ).length;

    const repairable = inventory.filter(
      (item) => String(item.status || "").toUpperCase() === "REPAIRABLE"
    ).length;

    return { good, damaged, repairable };
  }, [inventory]);

  const branchSummary = useMemo(() => {
    return {
      totalBranches: 1,
      activeBranches: 1,
      inactiveBranches: 0,
    };
  }, []);

  const stockTrendData = useMemo(() => {
    const monthly = data?.charts?.monthlyTrend || [];

    return monthly.map((row) => ({
      week: row.month,
      in: toNumber(row.amount),
      out: 0,
    }));
  }, [data]);

  const salesTrendData = useMemo(() => {
    const monthly = data?.charts?.monthlyTrend || [];

    return monthly.map((row) => ({
      week: row.month,
      purchase: toNumber(row.amount),
      sales: 0,
    }));
  }, [data]);

  const itemRows: InventoryRow[] = useMemo(() => {
    return inventory.map((item) => ({
      id: String(item.id),
      itemName: item.item || "-",
      name: item.item || "-",
      category: item.category || "General",
      quantity: toNumber(item.current_stock),
      stock: toNumber(item.current_stock),
      stockIn: toNumber(item.stock_in),
      stockOut: toNumber(item.stock_out),
      status: item.status || "-",
      href: `/super-admin/Branches/${encodeURIComponent(
        stateName
      )}/${encodeURIComponent(branchId)}/${encodeURIComponent(String(item.id))}`,
    }));
  }, [inventory, stateName, branchId]);

  if (!branchId) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="bg-white border border-[#EEF2F6] rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Branch not found
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            The branch you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <HeaderSkeleton />
        <OverviewCardsSkeleton />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <InventoryItemsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-[#EEF2F6] rounded-2xl shadow-sm p-6">
        <h1 className="text-[24px] md:text-[28px] font-semibold text-[#0F172A]">
          {data?.branch?.name || branchId}
        </h1>
        <p className="text-[13px] text-[#64748B] mt-1">
          Detailed branch analytics and inventory overview
        </p>
      </div>

      <div className="bg-white border border-[#EEF2F6] max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 rounded-2xl shadow-sm p-6">
        <BranchOverviewCounts
          stats={statsData}
          stockStatus={stockStatusData}
          branchSummary={branchSummary}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EEF2F6] max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 rounded-2xl shadow-sm p-6">
          <StockTrendBar data={stockTrendData} />
        </div>

        <div className="bg-white border border-[#EEF2F6] max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 rounded-2xl shadow-sm p-6">
          <SalesTrendLine data={salesTrendData} />
        </div>
      </div>

      <div className="bg-white border border-[#EEF2F6] max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 rounded-2xl shadow-sm p-6">
        <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">
          Inventory Items
        </h3>

        {inventoryReason ? (
          <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E] mb-4">
            {inventoryReason}
          </div>
        ) : null}

        <InventoryItems
          data={itemRows}
          branchId={String(branchId)}
          state={stateName}
        />
      </div>
    </div>
  );
}