"use client";

import { useEffect, useState } from "react";
import BranchOverviewCounts, {
  DashboardIcons,
} from "../Branches/Component/BranchOverviewPage";
import { StockTrendBar } from "../Branches/Component/StockTrendBar";
import { SalesTrendLine } from "../Branches/Component/SalesTrendLine";
import InventoryItems from "../Branches/Component/InventoryItems";
import { useAuth } from "../../../context/AuthContext";

/* ================= Helpers ================= */

function toNumber(value: any) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  return Number(String(value).replace(/,/g, "")) || 0;
}

function getUserBranchId(user: any) {
  if (!user) return null;

  return (
    user?.branch_id ||
    user?.branch?.id ||
    (Array.isArray(user?.branches) ? user.branches[0] : null) ||
    null
  );
}

/* ================= API ================= */

async function getBranchDashboard(branchId: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const res = await fetch(`${API_BASE}/sales/branch/${branchId}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);

    if (!res.ok) {
      throw new Error(json?.message || "API Error");
    }

    return json;
  } catch {
    console.error("❌ RAW RESPONSE:", text);
    throw new Error("Invalid JSON / API returned HTML");
  }
}

/* ================= Page ================= */

export default function AdminDashboardPage() {
  const { user, branchName, stateName, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const branchId = getUserBranchId(user);

  /* ================= Fetch ================= */

  useEffect(() => {
    if (authLoading || !user || !branchId) return;

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
        setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, branchId]);

  /* ================= STATES ================= */

  if (authLoading || loading) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
        <button
          className="block mt-3 bg-black text-white px-4 py-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-gray-500">No data available</div>;
  }

  /* ================= Data Mapping ================= */

  const cardsData = [
    {
      title: "Total Stock",
      value: toNumber(data?.cards?.totalSales),
      icon: DashboardIcons.Boxes,
    },
    {
      title: "Stock Value",
      value: toNumber(data?.cards?.salesThisMonth),
      icon: DashboardIcons.IndianRupee,
    },
    {
      title: "Total Sales",
      value: toNumber(data?.cards?.pendingQuotation),
      icon: DashboardIcons.ShoppingCart,
    },
    {
      title: "Total Clients",
      value: toNumber(data?.cards?.totalClients),
      icon: DashboardIcons.Users,
    },
  ];

  const stockTrendData =
    data?.charts?.stockTrend?.map((i: any, idx: number) => ({
      week: i.week || `Week ${idx + 1}`,
      in: toNumber(i.stockin),
      out: toNumber(i.stockout),
    })) || [];

  const salesTrendData =
    data?.charts?.quotationTrend?.map((i: any, idx: number) => ({
      week: i.week || `Week ${idx + 1}`,
      purchase: toNumber(i.rejected),
      sales: toNumber(i.pending),
    })) || [];

  const itemRows =
    data?.products?.map((item: any, i: number) => ({
      id: String(i + 1),
      itemName: item.productName,
      name: item.productName,
      category: item.category,
      quantity: toNumber(item.totalSales),
      stock: toNumber(item.totalSales),
      stockIn: toNumber(item.pendingQuotation),
      stockOut: toNumber(item.rejectedQuotation),
      status: "GOOD",
      href: "/admin/all-stocks",
    })) || [];

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
        <h1 className="text-2xl font-semibold">
          {branchName || "My Branch"}
        </h1>
        <p className="text-gray-500">{stateName}</p>
      </div>

      <BranchOverviewCounts cards={cardsData} loading={loading} />

      <div className="grid grid-cols-2 gap-6">
        <StockTrendBar data={stockTrendData} />
        <SalesTrendLine data={salesTrendData} />
      </div>

      <InventoryItems
        data={itemRows}
        branchId={branchId}
        stateName={stateName}
      />
    </div>
  );
}