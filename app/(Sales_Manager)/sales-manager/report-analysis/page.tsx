"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";
import ReportFilterBar from "./components/FilterBar";
import ProductCatChart from "./components/ProductCatChart";
import Profit from "./components/Profit";
import RecentTransactions from "./components/RecentTransactions";
import ReportState from "./components/ReportState";
import RevenueChart from "./components/RevanueChart";
import TopSelling from "./components/TopSelling";
import WeeklyActivity from "./components/WeeklyActivity";
import InventoryStatus from "./components/InventorySatus";
import ClientBreakDown from "./components/ClientBreakDown";
import QuickStatus from "./components/QuickStatus";

export type SalesReportResponse = {
  success: boolean;
  cards: {
    branchId?: number;
    revenue: number;
    avgOrderValue: number;
    totalOrders: string | number;
    activeClients: string | number;
  };
  revenueTrend: {
    branchId?: number;
    month: string;
    revenue: number;
    orders: string | number;
  }[];
  categoryDistribution: {
    branchId?: number;
    name: string;
    value: number;
  }[];
  weeklyActivity: {
    branchId?: number;
    day: string;
    quotations: string | number;
    approved: string | number;
    invoices: string | number;
  }[];
  profitAnalysis: {
    branchId?: number;
    month: string;
    profit: number;
  }[];
  topProducts: {
    branchId?: number;
    product_name: string;
    sales: string | number;
    revenue: number;
  }[];
  recentTransactions: {
    branchId?: number;
    invoice: string;
    client: string | null;
    amount: number;
    status: string;
  }[];
  inventoryStatus: {
    branchId?: number;
    inStock: string | number;
    lowStock: string | number;
    outOfStock: string | number;
  };
  clientBreakdown: {
    branchId?: number;
    newClients: string | number;
    returningClients: string | number;
  };
  quickStats: {
    branchId?: number;
    approvedQuotations: string | number;
    invoicesGenerated: string | number;
    pendingApprovals: string | number;
  };
};

function toNumber(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export default function ReportAnalysis() {
  const [reportData, setReportData] = useState<SalesReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    date: "",
    type: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        if (typeof window !== "undefined") {
          const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken");

          if (!token) {
            throw new Error("No token found. Please login again.");
          }
        }

        const params: Record<string, string> = {};
        if (filters.date) params.date = filters.date;
        if (filters.type) params.type = filters.type;

        const res = await api.get<SalesReportResponse>("/sales/report-all", {
          params,
        });

        if (!res?.data?.success) {
          throw new Error("Invalid report response");
        }

        if (mounted) {
          setReportData(res.data);
        }
      } catch (err: any) {
        console.error("Report API Error:", err);

        let message = "Failed to fetch report data";

        if (err?.response?.status === 401) {
          message = "Unauthorized. Please login again.";
        } else if (err?.response?.status === 403) {
          message = "Forbidden. You do not have access to this report.";
        } else if (err?.response?.data?.message) {
          message = err.response.data.message;
        } else if (err?.message) {
          message = err.message;
        }

        if (mounted) {
          setReportData(null);
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      mounted = false;
    };
  }, [filters.date, filters.type]);

  const normalizedData = useMemo(() => {
    if (!reportData) return null;

    return {
      cards: {
        revenue: toNumber(reportData.cards?.revenue),
        avgOrderValue: toNumber(reportData.cards?.avgOrderValue),
        totalOrders: toNumber(reportData.cards?.totalOrders),
        activeClients: toNumber(reportData.cards?.activeClients),
      },

      revenueTrend: (reportData.revenueTrend || []).map((item) => ({
        month: item.month || "",
        revenue: toNumber(item.revenue),
        orders: toNumber(item.orders),
      })),

      categoryDistribution: (reportData.categoryDistribution || []).map(
        (item) => ({
          name: item.name || "Unknown",
          value: toNumber(item.value),
        })
      ),

      weeklyActivity: (reportData.weeklyActivity || []).map((item) => ({
        day: item.day || "",
        quotations: toNumber(item.quotations),
        approved: toNumber(item.approved),
        invoices: toNumber(item.invoices),
      })),

      profitAnalysis: (reportData.profitAnalysis || []).map((item) => ({
        month: item.month || "",
        profit: toNumber(item.profit),
      })),

      topProducts: (reportData.topProducts || []).map((item) => ({
        product_name: item.product_name || "Unknown Product",
        sales: toNumber(item.sales),
        revenue: toNumber(item.revenue),
      })),

      recentTransactions: (reportData.recentTransactions || []).map((item) => ({
        invoice: item.invoice || "-",
        client: item.client || "Walk-in Client",
        amount: toNumber(item.amount),
        status: item.status || "unknown",
      })),

      inventoryStatus: {
        inStock: toNumber(reportData.inventoryStatus?.inStock),
        lowStock: toNumber(reportData.inventoryStatus?.lowStock),
        outOfStock: toNumber(reportData.inventoryStatus?.outOfStock),
      },

      clientBreakdown: {
        newClients: toNumber(reportData.clientBreakdown?.newClients),
        returningClients: toNumber(reportData.clientBreakdown?.returningClients),
      },

      quickStats: {
        approvedQuotations: toNumber(reportData.quickStats?.approvedQuotations),
        invoicesGenerated: toNumber(reportData.quickStats?.invoicesGenerated),
        pendingApprovals: toNumber(reportData.quickStats?.pendingApprovals),
      },
    };
  }, [reportData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading report analysis...
        </div>
      </div>
    );
  }

  if (error || !normalizedData) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center text-red-600 shadow-sm">
          {error || "Unable to load report data"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 ">
      <ReportState cards={normalizedData.cards} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={normalizedData.revenueTrend} />
        <ProductCatChart data={normalizedData.categoryDistribution} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyActivity data={normalizedData.weeklyActivity} />
        <Profit data={normalizedData.profitAnalysis} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopSelling data={normalizedData.topProducts} />
        <RecentTransactions data={normalizedData.recentTransactions} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <InventoryStatus data={normalizedData.inventoryStatus} />
        <ClientBreakDown data={normalizedData.clientBreakdown} />
        <QuickStatus data={normalizedData.quickStats} />
      </div>
    </div>
  );
}