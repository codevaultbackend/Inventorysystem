"use client";

import {
  AlertTriangle,
  Boxes,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

import AnalyticsStatCard from "./component/AnalyticsStatCard";
import MonthlySpendBudgetChart from "./component/MonthlySpendBudgetChart";
import StockMovementChart from "./component/StockMovementChart";
import PurchaseOrderTrendsChart from "./component/PurchaseOrderTrendsChart";
import CategoryDistributionChart from "./component/CategoryDistributionChart";

import axios from "axios";
import { useEffect, useState } from "react";

export default function ReportsAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= API CALL ================= */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) throw new Error("No token found");

        const res = await axios.get(
          "https://ims-swp9.onrender.com/combine/dashboard/reports",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success) {
          setData(res.data.dashboard);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");

        // optional auto logout
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F5F7FB]">
        <div className="mx-auto w-full max-w-[1328px]">
          <div className="space-y-4 sm:space-y-5 animate-pulse">
            <div>
              <div className="h-7 w-[220px] rounded-md bg-[#E5E7EB]" />
              <div className="mt-2 h-4 w-[320px] rounded-md bg-[#E5E7EB]" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
                      <div className="h-8 w-20 rounded bg-[#E5E7EB]" />
                      <div className="h-3 w-16 rounded bg-[#E5E7EB]" />
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#E5E7EB]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="mb-4 space-y-2">
                  <div className="h-5 w-40 rounded bg-[#E5E7EB]" />
                  <div className="h-4 w-56 rounded bg-[#E5E7EB]" />
                </div>
                <div className="h-[320px] w-full rounded-[18px] bg-[#E5E7EB]" />
              </div>

              <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="mb-4 space-y-2">
                  <div className="h-5 w-40 rounded bg-[#E5E7EB]" />
                  <div className="h-4 w-56 rounded bg-[#E5E7EB]" />
                </div>
                <div className="h-[320px] w-full rounded-[18px] bg-[#E5E7EB]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="mb-4 space-y-2">
                  <div className="h-5 w-40 rounded bg-[#E5E7EB]" />
                  <div className="h-4 w-56 rounded bg-[#E5E7EB]" />
                </div>
                <div className="h-[320px] w-full rounded-[18px] bg-[#E5E7EB]" />
              </div>

              <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="mb-4 space-y-2">
                  <div className="h-5 w-40 rounded bg-[#E5E7EB]" />
                  <div className="h-4 w-56 rounded bg-[#E5E7EB]" />
                </div>
                <div className="h-[320px] w-full rounded-[18px] bg-[#E5E7EB]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "Total Spend (YTD)",
      value: `₹${(data.cards.totalSpend / 10000000).toFixed(1)}Cr`,
      icon: DollarSign,
      iconBg: "bg-[#EEF4FF]",
      iconColor: "text-[#2F6FED]",
      trendText: "",
      trendColor: "text-[#22C55E]",
    },
    {
      title: "Total POs (YTD)",
      value: data.cards.totalPOs,
      icon: ShoppingCart,
      iconBg: "bg-[#F4ECFF]",
      iconColor: "text-[#9333EA]",
      trendText: "",
      trendColor: "text-[#EF4444]",
    },
    {
      title: "Total Stock Items",
      value: data.cards.totalStockItems,
      icon: Boxes,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
      trendText: "",
      trendColor: "text-[#22C55E]",
    },
    {
      title: "Low Stock Items",
      value: data.cards.lowStockItems,
      icon: AlertTriangle,
      iconBg: "bg-[#FEF2F2]",
      iconColor: "text-[#EF4444]",
      trendText: "",
      trendColor: "text-[#EF4444]",
    },
  ];

  const monthlySpendBudgetData = data.monthlySpend.map((item: any) => ({
    month: item.month,
    actual: Number((item.spend / 10000000).toFixed(2)),
    budget: Number((item.spend / 10000000).toFixed(2)),
  }));

  const stockMovementData = data.stockMovement.map((item: any) => ({
    month: item.month,
    stockIn: item.stockIn,
    stockOut: item.stockOut,
  }));

  /* ---- PURCHASE ORDER ---- */
  const purchaseOrderData = data.purchaseOrderTrends.map((item: any) => ({
    category: item.category,
    approved: item.approved,
    pending: item.pending,
    rejected: item.rejected,
  }));

  /* ---- CATEGORY DISTRIBUTION ---- */
  const total = data.categoryDistribution.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );

  const colors = ["#3E7BEA", "#F97316", "#14B8D4", "#84CC16", "#C84AE6"];

  const categoryDistributionData = data.categoryDistribution.map(
    (item: any, index: number) => ({
      name: item.category,
      value: Math.round((item.total / total) * 100),
      color: colors[index % colors.length],
    })
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB]">
      <div className="mx-auto w-full max-w-[1328px] ">
        <div className="space-y-4 sm:space-y-5">
          <div>
            <h1 className="text-[20px] font-[600] leading-[28px] text-[#111827] sm:text-[22px] sm:leading-[30px]">
              Reports and Analytics
            </h1>
            <p className="mt-[2px] text-[12px] text-[#667085] sm:text-[13px]">
              Monitor and manage inventory and purchase trends
            </p>
          </div>

          {/* ===== STAT CARDS ===== */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <AnalyticsStatCard key={card.title} {...card} />
            ))}
          </div>

          {/* ===== CHARTS ===== */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <MonthlySpendBudgetChart data={monthlySpendBudgetData} />
            <StockMovementChart data={stockMovementData} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <PurchaseOrderTrendsChart data={purchaseOrderData} />
            <CategoryDistributionChart data={categoryDistributionData} />
          </div>
        </div>
      </div>
    </div>
  );
}