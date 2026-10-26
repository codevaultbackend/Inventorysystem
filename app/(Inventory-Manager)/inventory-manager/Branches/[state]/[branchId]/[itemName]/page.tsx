"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, RefreshCcw } from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PurchaseChart,
  AgingChart,
} from "../../../../admin-dashboard/components/InventoryCharts";

import InventoryOverviewCards from "../../../../../Components/InventoryOverviewCards";
import HierarchyTable from "../../../../../Components/HierarchyTable";

import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/app/lib/inventoryDashboardApi";

const COLORS = ["#3B82F6", "#FF4D4F", "#8B5CF6", "#22C55E"];

type BatchRow = {
  id: number;
  batchNo: string;
  qty: number;
  value: number;
  damaged: number;
  dispatched: number;
};

function safeNumber(value: any) {
  const parsed = toNumber(value);

  if (Number.isNaN(parsed)) return 0;

  return parsed;
}

function normalizeChartData(data: any, batchRows: BatchRow[]) {
  const raw =
    data?.charts?.stockOverTime ||
    data?.charts?.purchaseAmountOverTime ||
    data?.charts?.monthlyPurchase ||
    data?.stockOverTime ||
    data?.purchaseAmountOverTime ||
    data?.monthlyPurchase ||
    [];

  if (Array.isArray(raw) && raw.length > 0) {
   return raw.map((item: any, index: number) => ({
  month:
    item?.month ||
    item?.label ||
    item?.name ||
    item?.date ||
    item?.period ||
    `Batch ${index + 1}`,

  amount: safeNumber(
    item?.value ||
      item?.amount ||
      item?.qty ||
      item?.quantity ||
      item?.total ||
      item?.totalValue
  ),
}));
  }

  return batchRows.map((item: any, index: number) => ({
  month: item?.batchNo || `Batch ${index + 1}`,

  amount: safeNumber(
    item?.value ||
    item?.qty
  ),
}));
}

function normalizeStatusData(data: any, batchRows: BatchRow[]) {
  const raw =
    data?.charts?.statusChart ||
    data?.charts?.statusDistribution ||
    data?.charts?.agingDistribution ||
    data?.statusChart ||
    data?.statusDistribution ||
    data?.agingDistribution ||
    [];

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item: any, index: number) => ({
      name: item?.status || item?.name || item?.label || `Group ${index + 1}`,

      value: safeNumber(
        item?.qty || item?.value || item?.total || item?.count
      ),

      color: COLORS[index % COLORS.length],
    }));
  }

  const available = batchRows.reduce(
    (sum, row) => sum + safeNumber(row?.qty),
    0
  );

  const damaged = batchRows.reduce(
    (sum, row) => sum + safeNumber(row?.damaged),
    0
  );

  const dispatched = batchRows.reduce(
    (sum, row) => sum + safeNumber(row?.dispatched),
    0
  );

  return [
    {
      name: "Available",
      value: available,
      color: "#3B82F6",
    },
    {
      name: "Damaged",
      value: damaged,
      color: "#FF4D4F",
    },
    {
      name: "Dispatched",
      value: dispatched,
      color: "#8B5CF6",
    },
  ].filter((item) => item.value > 0);
}




export default function InventoryItemPage() {
  const params = useParams();
  const router = useRouter();

  const branchId = String(params?.branchId || "").trim();

  const itemName = decodeURIComponent(
    String(params?.itemName || "").trim()
  );

  const abortRef = useRef<AbortController | null>(null);

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError("");

      if (!branchId || !itemName) {
        throw new Error("Branch ID or Item Name missing");
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();

      abortRef.current = controller;

      const encodedItemName = encodeURIComponent(itemName);

      const apiPath = `combine/dashboard/item/${branchId}/${encodedItemName}`;

      const response = await inventoryDashboardApi.get(apiPath, {
        signal: controller.signal,
      });

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message || "Invalid API response"
        );
      }

      setData(response.data);
    } catch (err: any) {
      if (
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED"
      ) {
        return;
      }

      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/login");

        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load item details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [branchId, itemName]);

  const batchRows: BatchRow[] = useMemo(() => {
    const raw =
      data?.batches ||
      data?.rows ||
      data?.data?.batches ||
      data?.itemBatches ||
      [];

    if (!Array.isArray(raw)) return [];

    return raw.map((item: any, index: number) => ({
      id: item?.id || index + 1,

      batchNo:
        item?.batch_no ||
        item?.batchNo ||
        item?.grnNo ||
        "-",

      qty: safeNumber(
        item?.qty || item?.quantity || item?.totalQty
      ),

      value: safeNumber(
        item?.value || item?.totalValue || item?.stockValue
      ),

      damaged: safeNumber(
        item?.damaged || item?.damagedStock || item?.scrap
      ),

      dispatched: safeNumber(
        item?.dispatched ||
          item?.stockOut ||
          item?.dispatch
      ),
    }));
  }, [data]);

  const stockChartData = useMemo(
    () => normalizeChartData(data, batchRows),
    [data, batchRows]
  );

  const statusChartData = useMemo(
    () => normalizeStatusData(data, batchRows),
    [data, batchRows]
  );

  const summary = useMemo(
    () => ({
      currentStock:
        safeNumber(data?.stats?.totalStock) ||
        safeNumber(data?.summary?.currentStock) ||
        batchRows.reduce(
          (sum: number, row: any) => sum + safeNumber(row?.qty),
          0
        ),

      totalStockValue:
        safeNumber(data?.stats?.totalValue) ||
        safeNumber(data?.summary?.totalStockValue) ||
        batchRows.reduce(
          (sum: number, row: any) => sum + safeNumber(row?.value),
          0
        ),

      totalItems:
        safeNumber(data?.stats?.entries) ||
        safeNumber(data?.summary?.totalItems) ||
        batchRows.length,

      stockIn:
        safeNumber(data?.stats?.stockIn) ||
        safeNumber(data?.summary?.stockIn),

      stockOut:
        safeNumber(data?.stats?.stockOut) ||
        safeNumber(data?.summary?.stockOut),
    }),
    [data, batchRows]
  );

  const columns = useMemo(
    () => [
      {
        key: "batchNo",

        title: "Batch No",

        render: (row: any) => (
          <span className="font-[600] text-[#111827]">
            {row?.batchNo || "-"}
          </span>
        ),
      },

      {
        key: "qty",

        title: "Qty",

        render: (row: any) =>
          formatNumber(safeNumber(row?.qty)),
      },

      {
        key: "value",

        title: "Value",

        render: (row: any) =>
          formatCurrency(safeNumber(row?.value)),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] animate-pulse space-y-5">
          <div className="h-[72px] rounded-[24px] bg-white" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-[140px] rounded-[24px] bg-white"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
            <div className="h-[400px] rounded-[24px] bg-white" />
            <div className="h-[400px] rounded-[24px] bg-white" />
          </div>

          <div className="h-[420px] rounded-[24px] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-[700px] flex-col items-center justify-center rounded-[24px] border border-red-200 bg-white px-6 py-10 text-center shadow-sm">
          <div className="mb-3 text-[18px] font-[700] text-red-600">
            Failed to Load Item Details
          </div>

          <p className="max-w-[500px] text-[14px] font-[500] text-[#64748B]">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchItemDetails}
            className="mt-5 flex items-center gap-2 rounded-[14px] bg-[#111827] px-5 py-3 text-[14px] font-[600] text-white transition hover:opacity-90"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] ">
      <div className="mx-auto w-full max-w-[1440px] space-y-5">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] active:scale-[0.98]"
          >
            <ChevronLeft className="h-[24px] w-[24px] stroke-[2.5]" />
          </button>

          <div className="min-w-0">
            <h1 className="break-words text-[24px] font-[700] leading-[32px] text-[#111827] sm:text-[28px] sm:leading-[36px]">
              {data?.item || data?.itemName || itemName}
            </h1>

            <p className="mt-1 text-[13px] font-[500] text-[#64748B]">
              Detailed item analytics and inventory overview
            </p>
          </div>
        </div>

        <InventoryOverviewCards summary={summary} />
         <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <PurchaseChart
            data={stockChartData}
          />

          <AgingChart
            data={statusChartData}
          />
        </div>

        {batchRows.length > 0 ? (
          <HierarchyTable
            title="Batch Overview"
            subtitle="Top batches for this item"
            data={batchRows}
            getViewHref={() => null}
            columns={columns}
          />
        ) : (
          <div className="rounded-[24px] border border-[#E2E8F0] bg-white px-6 py-16 text-center shadow-sm">
            <h3 className="text-[18px] font-[700] text-[#111827]">
              No Batch Data Found
            </h3>

            <p className="mt-2 text-[14px] font-[500] text-[#64748B]">
              No inventory batches are available for this item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}