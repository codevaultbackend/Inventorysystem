"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BranchOverviewCounts from "../../Component/BranchOverviewPage";
import { StockTrendBar } from "../../Component/StockTrendBar";
import { SalesTrendLine } from "../../Component/SalesTrendLine";
import InventoryItems from "../../Component/InventoryItems";
import {
  combineApi,
  extractApiArray,
  extractApiData,
  toNumber,
} from "../../../../../lib/combineDashboardApi";

type RawItem = {
  id?: number | string;
  itemId?: number | string;
  item_id?: number | string;
  itemName?: string;
  item_name?: string;
  name?: string;
  item?: string;
  productName?: string;
  product_name?: string;
  category?: string;
  categoryName?: string;
  category_name?: string;
  quantity?: number | string;
  qty?: number | string;
  totalQty?: number | string;
  stock?: number | string;
  current_stock?: number | string;
  currentStock?: number | string;
  hsn?: string;
  hsnCode?: string;
  hsn_code?: string;
  grn?: string;
  grnNo?: string;
  grn_no?: string;
  batchNo?: string;
  batch_no?: string;
  aging?: number | string;
  status?: string;
  stockIn?: number | string;
  stock_in?: number | string;
  stockOut?: number | string;
  stock_out?: number | string;
  totalValue?: number | string;
};

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
    categoryDistribution?: Array<{ category?: string; total?: number | string }>;
    monthlyTrend?: Array<{ month?: string; amount?: number | string }>;
    stockTrend?: Array<{
      month?: string;
      week?: string;
      in?: number | string;
      out?: number | string;
      stockIn?: number | string;
      stockOut?: number | string;
    }>;
    salesTrend?: Array<{
      month?: string;
      week?: string;
      purchase?: number | string;
      sales?: number | string;
      amount?: number | string;
    }>;
  };
};

type InventoryRow = {
  id: string;
  itemName: string;
  name: string;
  item: string;
  category: string;
  quantity: number | string;
  stock: number | string;
  current_stock: number | string;
  hsn: string;
  grn: string;
  batchNo: string;
  batch_no: string;
  aging: number | string;
  status: string;
  stockIn: number | string;
  stockOut: number | string;
  branchId: string;
  branch_id: string;
};

function HeaderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
      <div className="h-8 w-56 rounded-md bg-[#E9EEF5]" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-md bg-[#E9EEF5]" />
    </div>
  );
}

function OverviewCardsSkeleton() {
  return (
    <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 animate-pulse sm:grid-cols-2 xl:grid-cols-4">
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
    <div className="animate-pulse rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
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

function normalizeItems(items: RawItem[], branchId: string): InventoryRow[] {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const resolvedName =
        item?.itemName ||
        item?.item_name ||
        item?.name ||
        item?.item ||
        item?.productName ||
        item?.product_name ||
        `Item ${index + 1}`;

      const resolvedQty =
        item?.quantity ??
        item?.qty ??
        item?.totalQty ??
        item?.stock ??
        item?.current_stock ??
        item?.currentStock ??
        0;

      return {
        id: String(
          item?.id ??
          item?.itemId ??
          item?.item_id ??
          item?.item ??
          `${branchId}-${index + 1}`
        ),
        itemName: String(resolvedName),
        name: String(resolvedName),
        item: String(resolvedName),
        category: String(
          item?.category || item?.categoryName || item?.category_name || "General"
        ),
        quantity: resolvedQty,
        stock: resolvedQty,
        current_stock: resolvedQty,
        hsn: String(item?.hsn || item?.hsnCode || item?.hsn_code || "-"),
        grn: String(item?.grn || item?.grnNo || item?.grn_no || "-"),
        batchNo: String(item?.batchNo || item?.batch_no || "-"),
        batch_no: String(item?.batchNo || item?.batch_no || "-"),
        aging: item?.aging ?? "-",
        status: String(item?.status || "GOOD"),
        stockIn: item?.stockIn ?? item?.stock_in ?? 0,
        stockOut: item?.stockOut ?? item?.stock_out ?? 0,
        branchId: String(branchId),
        branch_id: String(branchId),
      };
    })
    .filter((row) => row.itemName.trim() !== "");
}

export default function BranchDetailsPage() {
  const params = useParams();
  const stateName = decodeURIComponent((params?.state as string) || "");
  const branchId = decodeURIComponent((params?.branchId as string) || "");

  const [dashboardData, setDashboardData] = useState<BranchDetailsPayload | null>(
    null
  );
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branchId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const combineRes = await combineApi.get(
          `/combine/dashboard/branch-id/${encodeURIComponent(branchId)}`
        );

        let sqlBranchRes: any = null;

        try {
          sqlBranchRes = await combineApi.get(
            `/sqlbranch/branch/${encodeURIComponent(branchId)}`
          );
        } catch {
          sqlBranchRes = null;
        }

        const combinePayload =
          extractApiData<BranchDetailsPayload>(combineRes) || {};

        const sqlItems = sqlBranchRes
          ? extractApiArray<RawItem>(sqlBranchRes)
          : [];

        const combineItems = extractApiArray<RawItem>(combineRes);

        const finalItems = sqlItems.length ? sqlItems : combineItems;
        const normalizedItems = normalizeItems(finalItems, branchId);

        setDashboardData(combinePayload);
        setInventoryRows(normalizedItems);

        console.log("combine response =>", combineRes?.data);
        console.log("sql response =>", sqlBranchRes?.data);
        console.log("combine items =>", combineItems);
        console.log("sql items =>", sqlItems);
        console.log("normalized items =>", normalizedItems);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load branch details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branchId]);

  const statsData = useMemo(() => {
    return {
      totalStock:
        toNumber(dashboardData?.summary?.currentStock) ||
        inventoryRows.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      totalStockValue: toNumber(dashboardData?.summary?.totalStockValue),
      totalSales: toNumber(dashboardData?.summary?.salesStockQty),
      agingItems: inventoryRows.filter((item) => Number(item.aging) > 0).length,
    };
  }, [dashboardData, inventoryRows]);

  const stockStatusData = useMemo(() => {
    const good = inventoryRows.filter(
      (item) => String(item.status || "").toUpperCase() === "GOOD"
    ).length;

    const damaged = inventoryRows.filter(
      (item) => String(item.status || "").toUpperCase() === "DAMAGED"
    ).length;

    const repairable = inventoryRows.filter(
      (item) => String(item.status || "").toUpperCase() === "REPAIRABLE"
    ).length;

    return { good, damaged, repairable };
  }, [inventoryRows]);

  const branchSummary = useMemo(() => {
    return {
      totalBranches: 1,
      activeBranches: 1,
      inactiveBranches: 0,
    };
  }, []);

  const stockTrendData = useMemo(() => {
    const stockTrend = Array.isArray(dashboardData?.charts?.stockTrend)
      ? dashboardData?.charts?.stockTrend
      : [];

    const monthly = Array.isArray(dashboardData?.charts?.monthlyTrend)
      ? dashboardData?.charts?.monthlyTrend
      : [];

    if (stockTrend.length > 0) {
      return stockTrend.map((row) => ({
        week: row.week || row.month || "-",
        in: toNumber(row.in ?? row.stockIn),
        out: toNumber(row.out ?? row.stockOut),
      }));
    }

    return monthly.map((row) => ({
      week: row.month || "-",
      in: toNumber(row.amount),
      out: 0,
    }));
  }, [dashboardData]);

  const salesTrendData = useMemo(() => {
    const salesTrend = Array.isArray(dashboardData?.charts?.salesTrend)
      ? dashboardData?.charts?.salesTrend
      : [];

    const monthly = Array.isArray(dashboardData?.charts?.monthlyTrend)
      ? dashboardData?.charts?.monthlyTrend
      : [];

    if (salesTrend.length > 0) {
      return salesTrend.map((row) => ({
        week: row.week || row.month || "-",
        purchase: toNumber(row.purchase),
        sales: toNumber(row.sales ?? row.amount),
      }));
    }

    return monthly.map((row) => ({
      week: row.month || "-",
      purchase: toNumber(row.amount),
      sales: 0,
    }));
  }, [dashboardData]);

  if (!branchId) {
    return <div className="p-6 text-red-600">Branch ID missing</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <HeaderSkeleton />
        <OverviewCardsSkeleton />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <InventoryItems data={[]} loading />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8">
      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
        <h1 className="text-[24px] font-semibold text-[#0F172A] md:text-[28px]">
          {dashboardData?.branch?.name || `Branch ${branchId}`}
        </h1>
        <p className="mt-1 text-[13px] text-[#64748B]">
          Detailed branch analytics and inventory overview
        </p>
      </div>

      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
        <BranchOverviewCounts
          stats={statsData}
          stockStatus={stockStatusData}
          branchSummary={branchSummary}
        />
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <StockTrendBar data={stockTrendData} />
        </div>

        <div className="min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <SalesTrendLine data={salesTrendData} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-[16px] font-semibold text-[#0F172A]">
          Inventory Items
        </h3>

        <InventoryItems
          data={inventoryRows}
          branchId={String(branchId)}
          state={stateName}
          branchName={dashboardData?.branch?.name || ""}
          loading={false}
        />
      </div>
    </div>
  );
}