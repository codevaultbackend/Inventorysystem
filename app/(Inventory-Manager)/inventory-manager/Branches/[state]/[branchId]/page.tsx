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

const COLORS = ["#3B82F6", "#FF4D4F", "#8B5CF6", "#22C55E"];

function normalizePurchaseChart(data: any, itemRows: any[]) {
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

  return itemRows.map((item: any, index: number) => ({
    label: item.itemName || `Item ${index + 1}`,
    value: toNumber(item.totalValue),
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

function PurchaseAmountChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((item) => toNumber(item.value)), 0);
  const yMax = maxValue <= 0 ? 100 : Math.ceil(maxValue / 10000) * 10000;

  return (
    <div className="h-[405px] rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-[700] leading-[24px] text-[#111827]">
          Purchase Amount Over Time
        </h2>


      </div>

      <div className="h-[315px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="branchPurchaseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              dy={12}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              domain={[0, yMax]}
            />

            <Tooltip
              formatter={(value) => formatCurrency(toNumber(value))}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                fontSize: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#branchPurchaseGradient)"
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AgingDistributionChart({ data }: { data: any[] }) {
  return (
    <div className="h-[405px] rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(16,24,40,0.08)]">
      <h2 className="text-[18px] font-[700] leading-[24px] text-[#111827]">
        Aging Distribution
      </h2>

      <p className="mt-2 text-[13px] font-[500] text-[#111827]">
        Stock breakdown by age groups
      </p>

      <div className="mt-4 flex h-[250px] items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                startAngle={90}
                endAngle={-270}
                paddingAngle={5}
                stroke="#ffffff"
                strokeWidth={8}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[13px] font-[600] text-[#94A3B8]">
            No aging data found
          </p>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-[12px] w-[12px] rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[13px] font-[600] text-[#475569]">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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
            <h1 className="text-[28px] font-[700] leading-[34px] text-[#111827]">
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_365px]">
          <PurchaseAmountChart data={purchaseChartData} />
          <AgingDistributionChart data={agingChartData} />
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