"use client";

import { useEffect, useMemo, useState } from "react";
import BranchOverviewCounts, {
  DashboardIcons,
} from "../Branches/Component/BranchOverviewPage";
import PendingRejectedStockChart from "../../Components/PendingRejectedStockChart";
import QuotationTrackingChart from "../../Components/QuotationTrackingChart";
import InventoryItems from "../Branches/Component/InventoryItems";
import { useAuth } from "../../../context/AuthContext";

/* ================= Helpers ================= */

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(String(value).replace(/,/g, "").trim()) || 0;
}

function getUserBranchId(user: any) {
  if (!user) return null;

  return (
    user?.branch_id ||
    user?.branchId ||
    user?.branch?.id ||
    user?.branch?.branch_id ||
    (Array.isArray(user?.branches) && user.branches.length > 0
      ? user.branches[0]?.id || user.branches[0]?.branch_id || user.branches[0]
      : null) ||
    null
  );
}

function formatWeekLabel(value: string, fallbackIndex: number) {
  if (!value) return `Week ${fallbackIndex + 1}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ================= API ================= */

async function getBranchDashboard(branchId: string | number) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  const res = await fetch(`${API_BASE}/sales/branch/${branchId}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    console.error("❌ RAW RESPONSE:", text);
    throw new Error("Invalid JSON / API returned HTML");
  }

  if (!res.ok) {
    throw new Error(
      json?.message || json?.error || `Request failed with status ${res.status}`
    );
  }

  return json;
}

/* ================= Page ================= */

export default function AdminDashboardPage() {
  const { user, branchName, stateName, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const branchId = useMemo(() => getUserBranchId(user), [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (!branchId) {
      setError("Branch ID not found for this user.");
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getBranchDashboard(branchId);

        if (!isMounted) return;
        setData(result);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to fetch dashboard data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, branchId]);

  if (authLoading || loading) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <p>{error}</p>
        <button
          className="mt-3 rounded-md bg-black px-4 py-2 text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data?.success) {
    return <div className="p-6 text-gray-500">No data available</div>;
  }

  const cards = data?.cards || {};
  const charts = data?.charts || {};
  const products = Array.isArray(data?.products) ? data.products : [];

  const cardsData = [
    {
      title: "Total Sales",
      value: toNumber(cards.totalSales),
      icon: DashboardIcons.ShoppingCart,
    },
    {
      title: "Pending Quotations",
      value: toNumber(cards.pendingQuotation),
      icon: DashboardIcons.Boxes,
    },
    {
      title: "Sales This Month",
      value: toNumber(cards.salesThisMonth),
      icon: DashboardIcons.IndianRupee,
    },
    {
      title: "Total Clients",
      value: toNumber(cards.totalClients),
      icon: DashboardIcons.Users,
    },
  ];

  const stockTrendData = Array.isArray(charts?.stockTrend)
    ? charts.stockTrend.map((item: any, index: number) => ({
        week: formatWeekLabel(item?.week, index),
        in: toNumber(item?.stockin),
        out: toNumber(item?.stockout),
      }))
    : [];

  const quotationTrendData = Array.isArray(charts?.quotationTrend)
    ? charts.quotationTrend.map((item: any, index: number) => ({
        week: formatWeekLabel(item?.week, index),
        pending: toNumber(item?.pending),
        rejected: toNumber(item?.rejected),
      }))
    : [];

  const itemRows = products.map((item: any, index: number) => ({
    id: String(index + 1),
    itemName: item?.productName || "-",
    name: item?.productName || "-",
    category: item?.category || "-",
    quantity: toNumber(item?.totalSales),
    stock: toNumber(item?.totalSales),
    stockIn: toNumber(item?.pendingQuotation),
    stockOut: toNumber(item?.rejectedQuotation),
    totalRevenue: toNumber(item?.totalRevenue),
    clients: toNumber(item?.clients),
    pendingQuotation: toNumber(item?.pendingQuotation),
    rejectedQuotation: toNumber(item?.rejectedQuotation),
    status:
      toNumber(item?.totalSales) > 0
        ? "ACTIVE"
        : toNumber(item?.pendingQuotation) > 0
        ? "PENDING"
        : "LOW",
    href: "/admin/all-stocks",
  }));

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
        <h1 className="text-2xl font-semibold">
          {branchName || "My Branch Dashboard"}
        </h1>
        <p className="text-gray-500">{stateName || "Branch Overview"}</p>
      </div>

      <BranchOverviewCounts cards={cardsData} loading={loading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PendingRejectedStockChart data={stockTrendData} />
        <QuotationTrackingChart data={quotationTrendData} />
      </div>

      <InventoryItems
        data={itemRows}
        branchId={branchId}
        stateName={stateName}
      />
    </div>
  );
}