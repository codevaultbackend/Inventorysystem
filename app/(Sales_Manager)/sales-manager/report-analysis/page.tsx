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
    revenue: number;
    avgordervalue: number;
    totalorders: string | number;
    activeclients: string | number;
  };
  revenueTrend: {
    month: string;
    revenue: number;
    orders: string | number;
  }[];
  categoryDistribution: {
    name: string;
    value: number;
  }[];
  weeklyActivity: {
    day: string;
    quotations: string | number;
    approved: string | number;
    invoices: string | number;
  }[];
  profitAnalysis: {
    month: string;
    profit: number;
  }[];
  topProducts: {
    product_name: string;
    sales: string | number;
    revenue: number;
  }[];
  recentTransactions: {
    invoice: string;
    client: string | null;
    amount: number;
    status: string;
  }[];
  inventoryStatus: {
    inStock: string | number;
    lowStock: string | number;
    outOfStock: string | number;
  };
  clientBreakdown: {
    newClients: string | number;
    returningClients: string | number;
  };
  quickStats: {
    approvedQuotations: string | number;
    invoicesGenerated: string | number;
    pendingApprovals: string | number;
  };
};

export default function ReportAnalysis() {
  const [reportData, setReportData] = useState<SalesReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
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
          const token = localStorage.getItem("token");
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

        if (!res.data?.success) {
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
  }, [filters]);

  const normalizedData = useMemo(() => {
    if (!reportData) return null;

    return {
      cards: {
        revenue: Number(reportData.cards?.revenue || 0),
        avgOrderValue: Number(reportData.cards?.avgordervalue || 0),
        totalOrders: Number(reportData.cards?.totalorders || 0),
        activeClients: Number(reportData.cards?.activeclients || 0),
      },

      revenueTrend: (reportData.revenueTrend || []).map((item) => ({
        month: item.month,
        revenue: Number(item.revenue || 0),
        orders: Number(item.orders || 0),
      })),

      categoryDistribution: (reportData.categoryDistribution || []).map((item) => ({
        name: item.name,
        value: Number(item.value || 0),
      })),

      weeklyActivity: (reportData.weeklyActivity || []).map((item) => ({
        day: item.day,
        quotations: Number(item.quotations || 0),
        approved: Number(item.approved || 0),
        invoices: Number(item.invoices || 0),
      })),

      profitAnalysis: (reportData.profitAnalysis || []).map((item) => ({
        month: item.month,
        profit: Number(item.profit || 0),
      })),

      topProducts: (reportData.topProducts || []).map((item) => ({
        product_name: item.product_name,
        sales: Number(item.sales || 0),
        revenue: Number(item.revenue || 0),
      })),

      recentTransactions: (reportData.recentTransactions || []).map((item) => ({
        invoice: item.invoice,
        client: item.client || "Walk-in Client",
        amount: Number(item.amount || 0),
        status: item.status,
      })),

      inventoryStatus: {
        inStock: Number(reportData.inventoryStatus?.inStock || 0),
        lowStock: Number(reportData.inventoryStatus?.lowStock || 0),
        outOfStock: Number(reportData.inventoryStatus?.outOfStock || 0),
      },

      clientBreakdown: {
        newClients: Number(reportData.clientBreakdown?.newClients || 0),
        returningClients: Number(reportData.clientBreakdown?.returningClients || 0),
      },

      quickStats: {
        approvedQuotations: Number(reportData.quickStats?.approvedQuotations || 0),
        invoicesGenerated: Number(reportData.quickStats?.invoicesGenerated || 0),
        pendingApprovals: Number(reportData.quickStats?.pendingApprovals || 0),
      },
    };
  }, [reportData]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
          Loading report analysis...
        </div>
      </div>
    );
  }

  if (error || !normalizedData) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center text-red-600 shadow-sm">
          {error || "Unable to load report data"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <ReportFilterBar onFilterChange={setFilters} />

      <ReportState cards={normalizedData.cards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={normalizedData.revenueTrend} />
        <ProductCatChart data={normalizedData.categoryDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyActivity data={normalizedData.weeklyActivity} />
        <Profit data={normalizedData.profitAnalysis} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSelling data={normalizedData.topProducts} />
        <RecentTransactions data={normalizedData.recentTransactions} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <InventoryStatus data={normalizedData.inventoryStatus} />
        <ClientBreakDown data={normalizedData.clientBreakdown} />
        <QuickStatus data={normalizedData.quickStats} />
      </div>
    </div>
  );
}