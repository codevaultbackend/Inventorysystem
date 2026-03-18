"use client";

import { AlertTriangle, Boxes, Package, Wrench } from "lucide-react";
import StockCount from "../../Components/StockCounts";
import AgingDistributionChart from "./component/AgingDistributionChart";
import AgingCategoryBarChart from "./component/AgingCategoryBarChart";
import AgingInventoryTable from "./component/AgingInventoryTable";

import axios from "axios";
import { useEffect, useState } from "react";

export default function StockAgingPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= API CALL ================= */
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const res = await axios.get(
          "https://ims-2gyk.onrender.com/combine/dashboard/aging",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success) {
          setDashboardData(res.data.dashboard);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
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

  if (!dashboardData) return null;

  /* ================= DATA MAPPING ================= */

  const stats = dashboardData.cards;

  const agingPieData = Object.entries(
    dashboardData.agingDistribution
  ).map(([key, value]: any, index) => ({
    name: key,
    value,
    color: [
      "#FF6A2B",
      "#41B8D5",
      "#C0268C",
      "#8AD14B",
      "#2563EB",
    ][index % 5],
  }));

  const categoryBarData = dashboardData.agingByCategory.map(
    (item: any) => ({
      name: item.category,
      blue: item.average,
      green: item.good,
      yellow: item.REPAIRABLE,
      red: item.damaged,
    })
  );

  const tableData = dashboardData.table.map((item: any) => ({
    po: item.purchaseOrderNo,
    item: item.itemName,
    category: item.categories,
    branch: item.branch,
    qty: `${item.quantity}`,
    value: `₹${item.value}`,
    status:
      item.status === "Fresh"
        ? "Good"
        : item.status === "Damaged"
        ? "Damaged"
        : "Repairable",
  }));

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB]">
      <div className="mx-auto w-full max-w-[1328px] px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        <div className="space-y-4 sm:space-y-5">
          <div>
            <h1 className="text-[20px] font-[600] leading-[28px] text-[#111827] sm:text-[22px] sm:leading-[30px]">
              Stock Aging Analysis
            </h1>
            <p className="mt-[2px] text-[12px] text-[#98A2B3] sm:text-[13px]">
              Detailed breakdown of inventory lifespan and turnover rates.
            </p>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StockCount title="Total Items" value={stats.totalItems} icon={Boxes} />
            <StockCount title="Fresh Stocks" value={stats.freshStocks} icon={Package} />
            <StockCount title="Critical" value={stats.critical} icon={AlertTriangle} />
            <StockCount title="Average Aging" value={stats.averageAging} icon={Wrench} />
          </div>

          {/* ================= CHARTS ================= */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)]">
            <AgingDistributionChart data={agingPieData} />
            <AgingCategoryBarChart data={categoryBarData} />
          </div>

          {/* ================= TABLE ================= */}
          <AgingInventoryTable data={tableData} />
        </div>
      </div>
    </div>
  );
}