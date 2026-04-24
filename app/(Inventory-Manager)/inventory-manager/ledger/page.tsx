"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import StockCount from "../../Components/StockCounts";
import BranchShareChart from "./component/BranchShareChart";
import CashflowChart from "./component/CashflowChart";
import LedgerTable from "./component/LedgerTable";

type DashboardResponse = {
  success: boolean;
  dashboard: {
    cards: {
      totalStockValue: string;
      totalSales: string;
      totalPurchases: string;
      pendingAmount: string;
    };
    monthlyCashflow: {
      month: string;
      month_no: number;
      inflow: string;
      outflow: string;
      amount: string;
    }[];
    categorywiseShare: {
      category: string;
      total: string;
    }[];
    clients: {
      id: number;
      clientCode: string;
      vendorName: string;
      email: string | null;
      phone: string | null;
      gstNumber: string | null;
      totalAmount: string;
      pendingAmount: string;
    }[];
  };
};

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function clearStoredTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("ims_token");
  localStorage.removeItem("imsToken");
  localStorage.removeItem("jwt");
}

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatMoney(value: unknown) {
  return `₹${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function LedgerScreen() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardResponse["dashboard"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-backend-nm9g.onrender.com";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();

        const res = await axios.get<DashboardResponse>(
          `${API_BASE}/combine/dashboard/complete`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!res.data?.success || !res.data?.dashboard) {
          throw new Error("Invalid dashboard response");
        }

        setDashboard(res.data.dashboard);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard";

        setError(message);

        if (err?.response?.status === 401) {
          clearStoredTokens();
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [API_BASE]);

  const counts = useMemo(() => {
    return {
      totalStockValue: toNumber(dashboard?.cards?.totalStockValue),
      totalSales: toNumber(dashboard?.cards?.totalSales),
      totalPurchases: toNumber(dashboard?.cards?.totalPurchases),
      pendingAmount: toNumber(dashboard?.cards?.pendingAmount),
    };
  }, [dashboard]);

  const cashflowData = useMemo(() => {
    return (dashboard?.monthlyCashflow || []).map((item) => ({
      month: item.month,
      inflow: toNumber(item.inflow),
      outflow: toNumber(item.outflow),
      amount: toNumber(item.amount),
    }));
  }, [dashboard]);

  const categoryShareData = useMemo(() => {
    const raw = dashboard?.categorywiseShare || [];

    const total = raw.reduce((sum, item) => sum + toNumber(item.total), 0);

    return raw.map((item) => ({
      name: item.category || "Unknown",
      value: total > 0 ? Math.round((toNumber(item.total) / total) * 100) : 0,
      amount: toNumber(item.total),
    }));
  }, [dashboard]);

  const tableData = useMemo(() => {
    return (dashboard?.clients || []).map((item) => ({
      id: item.id,
      vendor: item.vendorName || "-",
      email: item.email || "-",
      phone: item.phone || "-",
      amount: formatMoney(item.totalAmount),
      pending: formatMoney(item.pendingAmount),
      gst: item.gstNumber || "-",
      action: "View",
    }));
  }, [dashboard]);

  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-[1440px] bg-[#F4F6F9]">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[154px] rounded-[24px] bg-white" />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_365px]">
            <div className="h-[442px] rounded-[24px] bg-white" />
            <div className="h-[442px] rounded-[24px] bg-white" />
          </div>

          <div className="h-[430px] rounded-[24px] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-[24px] border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-600">
        {error}
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen w-full max-w-[1440px] bg-[#F4F6F9]">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StockCount
            title="Total Stock Value"
            value={counts.totalStockValue}
            icon={Package}
          />

          <StockCount
            title="Total Sales"
            value={counts.totalSales}
            icon={TrendingUp}
          />

          <StockCount
            title="Total Purchases"
            value={counts.totalPurchases}
            icon={ShoppingCart}
          />

          <StockCount
            title="Pending Amount"
            value={counts.pendingAmount}
            icon={Clock3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_365px]">
          <div className="h-[442px] overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div className="h-full w-full overflow-hidden">
              <CashflowChart data={cashflowData} />
            </div>
          </div>

          <div className="h-[442px] overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div className="h-full w-full overflow-hidden">
              <BranchShareChart data={categoryShareData} />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
          <LedgerTable
            columns={[
              { key: "vendor", label: "Vendor Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "amount", label: "Total Amount" },
              { key: "pending", label: "Pending Amount" },
              { key: "gst", label: "GST Number" },
              { key: "action", label: "Action" },
            ]}
            data={tableData}
            onView={(row) => {
              if (!row?.id) return;
              router.push(`/inventory-manager/ledger/${row.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}