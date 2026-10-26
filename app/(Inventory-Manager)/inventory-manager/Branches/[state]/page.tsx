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
import InventoryOverviewCards from "../../../Components/InventoryOverviewCards";
import HierarchyTable from "../../../Components/HierarchyTable";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/app/lib/inventoryDashboardApi";
import {
  PurchaseChart,
  AgingChart,
} from "../../admin-dashboard/components/InventoryCharts";

const COLORS = {
  blue: "#3B82F6",
  red: "#FF4D4F",
  purple: "#8B5CF6",
};

function normalizePurchaseChart(data: any, branchRows: any[]) {
  const raw =
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
      label:
        item.month ||
        item.label ||
        item.name ||
        item.date ||
        item.period ||
        `Item ${index + 1}`,
      value: toNumber(
        item.value ||
        item.amount ||
        item.purchaseAmount ||
        item.totalPurchase ||
        item.totalValue ||
        item.stockValue
      ),
    }));
  }

  return branchRows.map((branch: any, index: number) => ({
    label: branch.branchName || branch.name || `Branch ${index + 1}`,
    value: toNumber(
      branch.purchaseAmount ||
      branch.totalPurchase ||
      branch.totalValue ||
      branch.stockValue ||
      branch.totalStockValue
    ),
  }));
}

function normalizeAgingData(data: any, branchRows: any[]) {
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
      color:
        index === 0
          ? COLORS.blue
          : index === 1
            ? COLORS.red
            : COLORS.purple,
    }));
  }

  const available = branchRows.reduce(
    (sum, row) =>
      sum + toNumber(row.availableStock || row.currentStock || row.totalStock),
    0
  );

  const damaged = branchRows.reduce(
    (sum, row) => sum + toNumber(row.damaged || row.damagedStock || row.scrap),
    0
  );

  const dispatched = branchRows.reduce(
    (sum, row) => sum + toNumber(row.dispatched || row.stockOut || row.dispatch),
    0
  );

  return [
    { name: "Available", value: available, color: COLORS.blue },
    { name: "Damaged", value: damaged, color: COLORS.red },
    { name: "Dispatched", value: dispatched, color: COLORS.purple },
  ].filter((item) => item.value > 0);
}



export default function InventoryStatePage() {
  const params = useParams();
  const router = useRouter();

  const stateName = decodeURIComponent((params?.state as string) || "");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStateDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await inventoryDashboardApi.get(
          `/combine/dashboard/state/${encodeURIComponent(stateName)}`
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
          "Failed to load state details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (stateName) fetchStateDetails();
  }, [router, stateName]);

  const branchRows = useMemo(() => {
    return data?.branches || data?.stateData?.branches || data?.data?.branches || [];
  }, [data]);

  const purchaseChartData = useMemo(() => {
    return normalizePurchaseChart(data, branchRows);
  }, [data, branchRows]);

  const agingChartData = useMemo(() => {
    return normalizeAgingData(data, branchRows);
  }, [data, branchRows]);

  const summary = {
    currentStock:
      toNumber(data?.summary?.currentStock) ||
      toNumber(data?.stats?.totalStock) ||
      0,
    totalStockValue:
      toNumber(data?.summary?.totalStockValue) ||
      toNumber(data?.stats?.totalStockValue) ||
      0,
    totalItems:
      toNumber(data?.summary?.totalItems) ||
      toNumber(data?.stats?.totalItems) ||
      branchRows.length ||
      0,
    stockIn:
      toNumber(data?.summary?.stockIn) || toNumber(data?.stats?.stockIn) || 0,
    stockOut:
      toNumber(data?.summary?.stockOut) || toNumber(data?.stats?.stockOut) || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] space-y-4">
          <div className="flex animate-pulse items-start gap-4">
            <div className="h-[50px] w-[50px] rounded-[16px] bg-white" />
            <div>
              <div className="h-8 w-64 rounded bg-white" />
              <div className="mt-2 h-4 w-52 rounded bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-[150px] rounded-[24px] bg-white" />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_365px]">
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

          <div className="min-w-0 pt-[2px]">
            <h1 className="truncate text-[24px] font-[500] leading-[32px] tracking-[-0.03em] text-[#000000] sm:text-[28px] sm:leading-[34px]">
              {data?.state || stateName}
            </h1>
            <p className="mt-1 text-[12px] font-[600] leading-[16px] text-[#9CA3AF]">
              Detailed branch analytics and inventory
            </p>
          </div>
        </div>

        <InventoryOverviewCards summary={summary} />

        {/* CHART SECTION */}
        {/* CHART SECTION */}
<div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
  <PurchaseChart
    data={purchaseChartData}
  />

  <AgingChart
    data={agingChartData}
  />
</div>

        <HierarchyTable
          title="Branch Overview"
          subtitle="Branch wise inventory hierarchy"
          data={branchRows}
          getViewHref={(row) =>
            `/inventory-manager/Branches/${encodeURIComponent(
              stateName
            )}/${encodeURIComponent(String(row.branchId || row.id || ""))}`
          }
          columns={[
            {
              key: "branchName",
              title: "Branch Name",
              render: (row) => row.branchName || row.name || "-",
            },
            {
              key: "totalStock",
              title: "Total Stock",
              render: (row) => formatNumber(toNumber(row.totalStock || row.stock)),
            },
            {
              key: "totalValue",
              title: "Total Value",
              render: (row) =>
                formatCurrency(
                  toNumber(row.totalValue || row.stockValue || row.totalStockValue)
                ),
            },
            {
              key: "currentStock",
              title: "Current Stock",
              render: (row) =>
                formatNumber(toNumber(row.currentStock || row.availableStock)),
            },
            {
              key: "stockIn",
              title: "Stock In",
              render: (row) => formatNumber(toNumber(row.stockIn)),
            },
            {
              key: "stockOut",
              title: "Stock Out",
              render: (row) => formatNumber(toNumber(row.stockOut)),
            },
          ]}
        />
      </div>
    </div>
  );
}