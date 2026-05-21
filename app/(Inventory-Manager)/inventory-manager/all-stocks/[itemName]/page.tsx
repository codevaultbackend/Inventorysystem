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
import { useAuth } from "@/app/context/AuthContext";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/app/lib/inventoryDashboardApi";

const COLORS = ["#3B82F6", "#FF4D4F", "#8B5CF6", "#22C55E"];

function getNumericBranchId(value: any): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "number" && Number.isFinite(value)) return String(value);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const match = trimmed.match(/\d+/)?.[0] || "";
    return match;
  }

  if (typeof value === "object") {
    return (
      getNumericBranchId(value.branch_id) ||
      getNumericBranchId(value.branchId) ||
      getNumericBranchId(value.id) ||
      getNumericBranchId(value.branch?.id) ||
      getNumericBranchId(value.branch?.branch_id) ||
      ""
    );
  }

  return "";
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function resolveBranchId(params: any, user: any): string {
  const storedUser = getStoredUser();

  return (
    getNumericBranchId(params?.branchId) ||
    getNumericBranchId(params?.id) ||
    getNumericBranchId(user?.branch_id) ||
    getNumericBranchId(user?.branchId) ||
    getNumericBranchId(user?.branch?.id) ||
    getNumericBranchId(user?.branch?.branch_id) ||
    getNumericBranchId(user?.branches?.[0]?.id) ||
    getNumericBranchId(user?.branches?.[0]?.branch_id) ||
    getNumericBranchId(user?.branches?.[0]) ||
    getNumericBranchId(storedUser?.branch_id) ||
    getNumericBranchId(storedUser?.branchId) ||
    getNumericBranchId(storedUser?.branch?.id) ||
    getNumericBranchId(storedUser?.branch?.branch_id) ||
    getNumericBranchId(storedUser?.branches?.[0]?.id) ||
    getNumericBranchId(storedUser?.branches?.[0]?.branch_id) ||
    getNumericBranchId(storedUser?.branches?.[0]) ||
    ""
  );
}

function resolveExactItemName(params: any): string {
  return String(params?.itemName || params?.itemId || params?.slug || "").trim();
}

function normalizeLineChart(data: any, batchRows: any[]) {
  const raw =
    data?.charts?.monthlyTrend ||
    data?.charts?.stockOverTime ||
    data?.charts?.purchaseAmountOverTime ||
    data?.stockOverTime ||
    [];

  if (Array.isArray(raw) && raw.length) {
    return raw.map((item: any, index: number) => ({
      label: item.month || item.label || item.name || `Batch ${index + 1}`,
      value: toNumber(item.value || item.amount || item.qty || item.totalValue),
    }));
  }

  return batchRows.map((item: any, index: number) => ({
    label: item.batchNo || `Batch ${index + 1}`,
    value: toNumber(item.value || item.qty),
  }));
}

function normalizeDonutChart(data: any, batchRows: any[]) {
  const raw =
    data?.charts?.statusChart ||
    data?.charts?.agingChart ||
    data?.statusChart ||
    data?.agingChart ||
    [];

  if (Array.isArray(raw) && raw.length) {
    return raw.map((item: any, index: number) => ({
      name: item.status || item.aging || item.name || item.label || `Group ${index + 1}`,
      value: toNumber(item.qty || item.value || item.total || item.count),
      color: COLORS[index % COLORS.length],
    }));
  }

  const available = batchRows.reduce((sum, row) => sum + toNumber(row.qty), 0);

  return available
    ? [{ name: "Available", value: available, color: "#3B82F6" }]
    : [];
}

function StockValueChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((item) => toNumber(item.value)), 0);
  const yMax = maxValue <= 0 ? 100 : Math.ceil(maxValue / 100) * 100;

  return (
    <div className="h-[378px] rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] sm:h-[405px] sm:px-6 sm:py-6">
      <h2 className="mb-5 text-[18px] font-[700] leading-[24px] tracking-[-0.02em] text-[#111827]">
        Stock Value Over Time
      </h2>

      <div className="h-[292px] w-full sm:h-[315px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 4, left: -10, bottom: 2 }}>
              <defs>
                <linearGradient id="itemStockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }} dy={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }} domain={[0, yMax]} />
              <Tooltip formatter={(value) => formatCurrency(toNumber(value))} />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fill="url(#itemStockGradient)" activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] font-[600] text-[#94A3B8]">
            No stock data found
          </div>
        )}
      </div>
    </div>
  );
}

function ItemStatusChart({ data }: { data: any[] }) {
  return (
    <div className="h-[378px] rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] sm:h-[405px] sm:px-6 sm:py-6">
      <h2 className="text-[18px] font-[700] leading-[24px] tracking-[-0.02em] text-[#111827]">
        Item Status Distribution
      </h2>

      <p className="mt-2 text-[13px] font-[600] leading-[18px] text-[#111827]">
        Status wise item quantity
      </p>

      <div className="mt-4 flex h-[222px] items-center justify-center sm:h-[250px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={66} outerRadius={104} startAngle={90} endAngle={-270} paddingAngle={5} stroke="#ffffff" strokeWidth={8}>
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

      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="h-[12px] w-[12px] rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span className="text-[13px] font-[700] text-[#475569]">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryItemPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <div className="h-[96px] animate-pulse rounded-[24px] bg-white" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-[150px] animate-pulse rounded-[24px] bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_365px]">
          <div className="h-[405px] animate-pulse rounded-[24px] bg-white" />
          <div className="h-[405px] animate-pulse rounded-[24px] bg-white" />
        </div>
        <div className="h-[430px] animate-pulse rounded-[24px] bg-white" />
      </div>
    </div>
  );
}

export default function InventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const branchId = useMemo(() => resolveBranchId(params, user), [params, user]);
  const itemName = useMemo(() => resolveExactItemName(params), [params]);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError("");

        if (!branchId) {
          console.error("BRANCH ID DEBUG:", {
            params,
            authUser: user,
            storedUser: getStoredUser(),
          });
          throw new Error("Invalid branch id");
        }

        if (!itemName) throw new Error("Invalid item name");

        const endpoint = `/combine/dashboard/item/${encodeURIComponent(
          branchId
        )}/${encodeURIComponent(itemName)}`;

        console.log("ITEM DETAIL FETCH DEBUG:", {
          branchId,
          itemName,
          endpoint,
          fullUrl: `${inventoryDashboardApi.defaults.baseURL}${endpoint}`,
        });

        const res = await inventoryDashboardApi.get(endpoint);
        const responseData = res?.data;

        if (responseData?.success || responseData?.item || responseData?.stats) {
          setData(responseData);
        } else {
          throw new Error(responseData?.message || "Invalid API response");
        }
      } catch (err: any) {
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

    if (!authLoading) {
      fetchItemDetails();
    }
  }, [authLoading, branchId, itemName, params, router, user]);

  const batchRows = useMemo(() => {
    const raw = data?.batches || data?.rows || data?.data?.batches || [];

    return Array.isArray(raw)
      ? raw.map((item: any, index: number) => ({
          id: item?.id || index + 1,
          batchNo: item?.batch_no || item?.batchNo || item?.grn || item?.grnNo || "-",
          poNumber: item?.po_number || item?.poNumber || "-",
          qty: toNumber(item?.qty || item?.quantity || item?.totalQty),
          value: toNumber(item?.value || item?.totalValue || item?.stockValue),
        }))
      : [];
  }, [data]);

  const lineChartData = useMemo(() => normalizeLineChart(data, batchRows), [data, batchRows]);
  const donutChartData = useMemo(() => normalizeDonutChart(data, batchRows), [data, batchRows]);

  const summary = useMemo(() => {
    return {
      currentStock:
        toNumber(data?.stats?.totalStock) ||
        batchRows.reduce((sum: number, row: any) => sum + toNumber(row.qty), 0),
      totalStockValue:
        toNumber(data?.stats?.totalValue) ||
        batchRows.reduce((sum: number, row: any) => sum + toNumber(row.value), 0),
      totalItems: toNumber(data?.stats?.entries) || batchRows.length,
      stockIn: toNumber(data?.stats?.stockIn),
      stockOut: toNumber(data?.stats?.stockOut),
    };
  }, [data, batchRows]);

  if (loading || authLoading) return <InventoryItemPageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="rounded-[24px] border border-red-200 bg-white px-5 py-5 shadow-sm">
            <h2 className="text-[20px] font-semibold text-[#111827]">
              Unable to load item details
            </h2>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[14px] border border-[#D0D5DD] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F8FAFC]"
            >
              Back
            </button>
          </div>
        </div>
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
            <h1 className="truncate text-[24px] font-[500] leading-[32px] tracking-[-0.03em] text-[#000000]">
              {data?.item || data?.itemName || itemName}
            </h1>
            <p className="mt-1 text-[12px] font-[600] leading-[16px] text-[#9CA3AF]">
              Detailed item analytics and inventory
            </p>
          </div>
        </div>

        <InventoryOverviewCards summary={summary} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_365px]">
          <StockValueChart data={lineChartData} />
          <ItemStatusChart data={donutChartData} />
        </div>

        <HierarchyTable
          title="Batch Overview"
          subtitle="Top batches for this item"
          data={batchRows}
          hideAction
          getViewHref={() => null}
          columns={[
            {
              key: "batchNo",
              title: "Batch No",
              render: (row: any) => row?.batchNo || "-",
            },
            {
              key: "poNumber",
              title: "PO Number",
              render: (row: any) => row?.poNumber || "-",
            },
            {
              key: "qty",
              title: "Qty",
              render: (row: any) => formatNumber(toNumber(row?.qty)),
            },
            {
              key: "value",
              title: "Value",
              render: (row: any) => formatCurrency(toNumber(row?.value)),
            },
          ]}
        />
      </div>
    </div>
  );
}