"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
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
import InventoryOverviewCards from "../../../../Components/InventoryOverviewCards";
import HierarchyTable from "../../../../Components/HierarchyTable";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
  slugifyText,
} from "@/app/lib/inventoryDashboardApi";
import {
  PurchaseChart,
  AgingChart,
} from "../../../admin-dashboard/components/InventoryCharts";

const COLORS = ["#3B82F6", "#FF4D4F", "#8B5CF6", "#22C55E"];

function normalizePurchaseChart(data: any, itemRows: any[]) {
  const raw =
    data?.charts?.branchValueChart ||
    data?.charts?.purchaseAmountOverTime ||
    data?.charts?.purchaseChart ||
    data?.charts?.monthlyPurchase ||
    data?.purchaseAmountOverTime ||
    data?.purchaseChart ||
    data?.monthlyPurchase ||
    data?.analytics?.purchaseAmountOverTime ||
    [];

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item: any, index: number) => ({
      month:
        item.month ||
        item.label ||
        item.name ||
        item.date ||
        item.period ||
        `Item ${index + 1}`,

      amount: toNumber(
        item.value ||
        item.amount ||
        item.purchaseAmount ||
        item.totalPurchase ||
        item.totalValue ||
        item.stockValue
      ),
    }));
  }

  return itemRows.map((item: any, index: number) => ({
    month: item.itemName || `Item ${index + 1}`,

    amount: toNumber(
      item.totalValue ||
      item.value ||
      item.stockValue ||
      item.totalStockValue
    ),
  }));
}

function normalizeAgingData(data: any, itemRows: any[]) {
  const raw =
    data?.charts?.agingDistribution ||
    data?.charts?.aging ||
    data?.agingDistribution ||
    data?.aging ||
    data?.analytics?.agingDistribution ||
    [];

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item: any, index: number) => ({
      name: item.name || item.label || item.status || `Group ${index + 1}`,
      value: toNumber(item.value || item.count || item.total || item.quantity),
      color: COLORS[index % COLORS.length],
    }));
  }

  const available = itemRows.reduce(
    (sum, row) => sum + toNumber(row.totalQty || row.currentStock),
    0
  );

  const damaged = itemRows.reduce(
    (sum, row) => sum + toNumber(row.damaged || row.damagedStock || row.scrap),
    0
  );

  const dispatched = itemRows.reduce(
    (sum, row) => sum + toNumber(row.dispatched || row.stockOut || row.dispatch),
    0
  );

  return [
    { name: "Available", value: available, color: "#3B82F6" },
    { name: "Damaged", value: damaged, color: "#FF4D4F" },
    { name: "Dispatched", value: dispatched, color: "#8B5CF6" },
  ].filter((item) => item.value > 0);
}





export default function InventoryBranchPage() {
  const params = useParams();
  const router = useRouter();

  const stateName = decodeURIComponent((params?.state as string) || "");
  const branchId = decodeURIComponent((params?.branchId as string) || "");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await inventoryDashboardApi.get(
          `/combine/dashboard/branch-id/${encodeURIComponent(branchId)}`
        );

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Invalid API response");
        }

        setData(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.clear();
          router.replace("/login");
          return;
        }

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load branch details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (branchId) fetchBranchDetails();
  }, [branchId, router]);

  const itemRows = useMemo(() => {
    const raw = data?.allItems || data?.items || data?.data?.items || [];

    return raw.map((item: any) => ({
      itemName: item.item || item.itemName || item.name || "NA",
      slugItemName: slugifyText(item.item || item.itemName || item.name || ""),
      totalQty: toNumber(
        item.totalQty || item.qty || item.quantity || item.totalStock
      ),
      totalValue: toNumber(item.totalValue || item.value || item.stockValue),
      currentStock: toNumber(item.currentStock || item.availableStock),
      damaged: toNumber(item.damaged || item.damagedStock || item.scrap),
      dispatched: toNumber(item.dispatched || item.stockOut || item.dispatch),
    }));
  }, [data]);

  const purchaseChartData = useMemo(() => {
    return normalizePurchaseChart(data, itemRows);
  }, [data, itemRows]);

  const agingChartData = useMemo(() => {
    return normalizeAgingData(data, itemRows);
  }, [data, itemRows]);

  console.log("purchaseChartData", purchaseChartData);

  const summary = {
    currentStock:
      toNumber(data?.summary?.currentStock) ||
      toNumber(data?.stats?.totalStock) ||
      itemRows.reduce((sum: number, item: any) => sum + toNumber(item.totalQty), 0),
    totalStockValue:
      toNumber(data?.summary?.totalStockValue) ||
      toNumber(data?.stats?.totalStockValue) ||
      itemRows.reduce(
        (sum: number, item: any) => sum + toNumber(item.totalValue),
        0
      ),
    totalItems:
      toNumber(data?.summary?.totalItems) ||
      toNumber(data?.stats?.totalItems) ||
      itemRows.length,
    stockIn:
      toNumber(data?.summary?.stockIn) || toNumber(data?.stats?.stockIn) || 0,
    stockOut:
      toNumber(data?.summary?.stockOut) || toNumber(data?.stats?.stockOut) || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 animate-pulse">
          <div className="h-[72px] rounded-[24px] bg-white" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-[150px] rounded-[24px] bg-white" />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_365px]">
            <div className="h-[405px] rounded-[24px] bg-white" />
            <div className="h-[405px] rounded-[24px] bg-white" />
          </div>

          <div className="h-[430px] rounded-[24px] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1440px] space-y-4">
        <div className="flex items-start gap-4">

          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition hover:bg-[#F9FAFB] active:scale-[0.98]"
            aria-label="Go back"
          >
            <ChevronLeft className="h-[26px] w-[26px] stroke-[2.5]" />
          </button>

          <div>
            <h1 className="text-[24px] font-[500] leading-[100%] text-[#000000]">
              {data?.branch?.name ||
                data?.branchName ||
                data?.branch?.branchName ||
                "Branch Details"}
            </h1>
            <p className="mt-1 text-[12px] font-[500] text-[#9CA3AF]">
              Detailed branch analytics and inventory
            </p>
          </div>
        </div>

        <InventoryOverviewCards summary={summary} />


        <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <PurchaseChart
            data={purchaseChartData}
          />

          <AgingChart
            data={agingChartData}
          />
        </div>

        <HierarchyTable
          title="Inventory Items"
          subtitle="Item wise inventory summary"
          data={itemRows}
          getViewHref={(row) =>
            `/inventory-manager/Branches/${encodeURIComponent(
              stateName
            )}/${encodeURIComponent(branchId)}/${encodeURIComponent(
              row.slugItemName
            )}`
          }
          columns={[
            {
              key: "itemName",
              title: "Item Name",
              render: (row) => row.itemName || "-",
            },
            {
              key: "totalQty",
              title: "Total Qty",
              render: (row) => formatNumber(toNumber(row.totalQty)),
            },
            {
              key: "totalValue",
              title: "Total Value",
              render: (row) => formatCurrency(toNumber(row.totalValue)),
            },
          ]}
        />
      </div>
    </div>
  );
}