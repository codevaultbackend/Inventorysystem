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

function PurchaseAmountChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((item) => toNumber(item.value)), 0);
  const yMax = maxValue <= 0 ? 100 : Math.ceil(maxValue / 10000) * 10000;

  return (
    <div className="h-[378px] rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-[1px_1px_4px_rgba(0,0,0,0.1)] sm:h-[405px] sm:px-6 sm:py-6">
      <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
        <h2 className="text-[18px] font-[700] leading-[24px] tracking-[-0.02em] text-[#111827] sm:text-[18px]">
          Purchase Amount Over Time
        </h2>


      </div>

      <div className="h-[292px] w-full sm:h-[315px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 6, right: 4, left: -10, bottom: 2 }}
            >
              <defs>
                <linearGradient
                  id="purchaseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
                dy={12}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
                domain={[0, yMax]}
              />

              <Tooltip
                formatter={(value) => formatCurrency(toNumber(value))}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
                  fontSize: "12px",
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#purchaseGradient)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] font-[600] text-[#94A3B8]">
            No purchase data found
          </div>
        )}
      </div>
    </div>
  );
}

function AgingDistributionChart({ data }: { data: any[] }) {
  return (
    <div className="h-[378px] rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] sm:h-[405px] sm:px-6 sm:py-6">
      <h2 className="text-[18px] font-[700] leading-[24px] tracking-[-0.02em] text-[#111827] sm:text-[18px]">
        Aging Distribution
      </h2>

      <p className="mt-2 text-[13px] font-[600] leading-[18px] text-[#111827]">
        Stock breakdown by age groups
      </p>

      <div className="mt-4 flex h-[222px] items-center justify-center sm:h-[250px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={66}
                outerRadius={104}
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

      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-[12px] w-[12px] rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[13px] font-[700] text-[#475569]">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_365px]">
          <PurchaseAmountChart data={purchaseChartData} />
          <AgingDistributionChart data={agingChartData} />
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