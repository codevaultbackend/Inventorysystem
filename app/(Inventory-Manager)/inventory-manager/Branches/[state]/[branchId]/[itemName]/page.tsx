"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
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
import InventoryOverviewCards from "../../../../../Components/InventoryOverviewCards";
import HierarchyTable from "../../../../../Components/HierarchyTable";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/app/lib/inventoryDashboardApi";

const COLORS = ["#3B82F6", "#FF4D4F", "#8B5CF6", "#22C55E"];

function normalizeChartData(data: any, batchRows: any[]) {
  const raw =
    data?.charts?.stockOverTime ||
    data?.charts?.purchaseAmountOverTime ||
    data?.charts?.monthlyPurchase ||
    data?.stockOverTime ||
    data?.purchaseAmountOverTime ||
    data?.monthlyPurchase ||
    [];

  if (Array.isArray(raw) && raw.length) {
    return raw.map((item: any, index: number) => ({
      label:
        item.month ||
        item.label ||
        item.name ||
        item.date ||
        item.period ||
        `Batch ${index + 1}`,
      value: toNumber(
        item.value ||
          item.amount ||
          item.qty ||
          item.quantity ||
          item.total ||
          item.totalValue
      ),
    }));
  }

  return batchRows.map((item: any, index: number) => ({
    label: item.batchNo || `Batch ${index + 1}`,
    value: toNumber(item.value || item.qty),
  }));
}

function normalizeStatusData(data: any, batchRows: any[]) {
  const raw =
    data?.charts?.statusChart ||
    data?.charts?.statusDistribution ||
    data?.charts?.agingDistribution ||
    data?.statusChart ||
    data?.statusDistribution ||
    data?.agingDistribution ||
    [];

  if (Array.isArray(raw) && raw.length) {
    return raw.map((item: any, index: number) => ({
      name: item.status || item.name || item.label || `Group ${index + 1}`,
      value: toNumber(item.qty || item.value || item.total || item.count),
      color: COLORS[index % COLORS.length],
    }));
  }

  const available = batchRows.reduce(
    (sum, row) => sum + toNumber(row.qty || row.availableStock),
    0
  );

  const damaged = batchRows.reduce(
    (sum, row) => sum + toNumber(row.damaged || row.damagedStock || row.scrap),
    0
  );

  const dispatched = batchRows.reduce(
    (sum, row) => sum + toNumber(row.dispatched || row.stockOut || row.dispatch),
    0
  );

  return [
    { name: "Available", value: available, color: "#3B82F6" },
    { name: "Damaged", value: damaged, color: "#FF4D4F" },
    { name: "Dispatched", value: dispatched, color: "#8B5CF6" },
  ].filter((item) => item.value > 0);
}

function StockOverTimeChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((item) => toNumber(item.value)), 0);
  const yMax = maxValue <= 0 ? 100 : Math.ceil(maxValue / 100) * 100;

  return (
    <div className="h-[405px] rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(16,24,40,0.08)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-[700] leading-[24px] text-[#111827]">
          Stock Value Over Time
        </h2>
      </div>

      <div className="h-[315px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="itemStockGradient" x1="0" y1="0" x2="0" y2="1">
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

            <Tooltip formatter={(value) => formatCurrency(toNumber(value))} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#itemStockGradient)"
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatusDistributionChart({ data }: { data: any[] }) {
  return (
    <div className="h-[405px] rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(16,24,40,0.08)]">
      <h2 className="text-[18px] font-[700] leading-[24px] text-[#111827]">
        Item Status Distribution
      </h2>

      <p className="mt-2 text-[13px] font-[500] text-[#111827]">
        Status wise item quantity
      </p>

      <div className="mt-4 flex h-[250px] items-center justify-center">
        {data.length ? (
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
            No status data found
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

export default function InventoryItemPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const branchId = String(params?.branchId || "").trim();
  const itemName = String(params?.itemName || "").trim();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError("");

        console.group("ITEM PAGE DEBUG");
        console.log("window.location.href:", window.location.href);
        console.log("pathname:", pathname);
        console.log("raw params:", params);
        console.log("branchId from params:", branchId);
        console.log("itemName from params:", itemName);
        console.log("itemName includes space:", itemName.includes(" "));
        console.log("itemName includes hyphen:", itemName.includes("-"));

        if (!branchId || !itemName) {
          console.error("Missing params", { branchId, itemName });
          throw new Error("Branch ID or item name missing from route params");
        }

        const apiPath = `combine/dashboard/item/${branchId}/${itemName}`;
        const fullApiUrl = `${inventoryDashboardApi.defaults.baseURL}${apiPath}`;

        console.log("apiPath:", apiPath);
        console.log("fullApiUrl:", fullApiUrl);
        console.groupEnd();

        const res = await inventoryDashboardApi.get(apiPath);

        console.log("ITEM API RESPONSE:", res.data);

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Invalid API response");
        }

        setData(res.data);
      } catch (err: any) {
        console.error("ITEM API ERROR:", {
          message: err?.message,
          status: err?.response?.status,
          response: err?.response?.data,
          url: err?.config?.url,
          baseURL: err?.config?.baseURL,
        });

        if (err?.response?.status === 401) {
          localStorage.clear();
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

    fetchItemDetails();
  }, [branchId, itemName, pathname, params, router]);

  const batchRows = useMemo(() => {
    const raw =
      data?.batches ||
      data?.rows ||
      data?.data?.batches ||
      data?.itemBatches ||
      [];

    return raw.map((item: any, index: number) => ({
      id: item.id || index + 1,
      batchNo: item.batch_no || item.batchNo || item.grnNo || "-",
      qty: toNumber(item.qty || item.quantity || item.totalQty),
      value: toNumber(item.value || item.totalValue || item.stockValue),
      damaged: toNumber(item.damaged || item.damagedStock || item.scrap),
      dispatched: toNumber(item.dispatched || item.stockOut || item.dispatch),
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

  const summary = {
    currentStock:
      toNumber(data?.stats?.totalStock) ||
      toNumber(data?.summary?.currentStock) ||
      batchRows.reduce((sum: number, row: any) => sum + toNumber(row.qty), 0),

    totalStockValue:
      toNumber(data?.stats?.totalValue) ||
      toNumber(data?.summary?.totalStockValue) ||
      batchRows.reduce((sum: number, row: any) => sum + toNumber(row.value), 0),

    totalItems:
      toNumber(data?.stats?.entries) ||
      toNumber(data?.summary?.totalItems) ||
      batchRows.length,

    stockIn:
      toNumber(data?.stats?.stockIn) || toNumber(data?.summary?.stockIn) || 0,

    stockOut:
      toNumber(data?.stats?.stockOut) || toNumber(data?.summary?.stockOut) || 0,
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
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white text-[40px] leading-none text-[#111827] shadow-sm"
          >
            ‹
          </button>

          <div>
            <h1 className="text-[28px] font-[700] leading-[34px] text-[#111827]">
              {data?.item || data?.itemName || itemName}
            </h1>
            <p className="mt-1 text-[12px] font-[500] text-[#9CA3AF]">
              Detailed item analytics and inventory
            </p>
          </div>
        </div>

        <InventoryOverviewCards summary={summary} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_365px]">
          <StockOverTimeChart data={stockChartData} />
          <StatusDistributionChart data={statusChartData} />
        </div>

        <HierarchyTable
          title="Batch Overview"
          subtitle="Top batches for this item"
          data={batchRows}
          getViewHref={() => null}
          columns={[
            {
              key: "batchNo",
              title: "Batch No",
              render: (row) => row.batchNo || "-",
            },
            {
              key: "qty",
              title: "Qty",
              render: (row) => formatNumber(toNumber(row.qty)),
            },
            {
              key: "value",
              title: "Value",
              render: (row) => formatCurrency(toNumber(row.value)),
            },
          ]}
        />
      </div>
    </div>
  );
}