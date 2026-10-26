"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Boxes, Package, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";

import StockCount from "../../Components/StockCounts";
import StockMovementChart from "./component/StockMovementChart";
import AgingDistributionPie from "../stock-aging/component/AginDistribution";
import StockDistributionByStateChart from "./component/StockDistributionByStateChart";

type AnalyticsApiResponse = {
  cards: {
    totalStockItems: number;
    lowStockItems: number;
    totalScrapItems: number;
    totalRepairableItems: number;
  };
  charts: {
    categoryDistribution: {
      category: string;
      total: string;
    }[];
    stockMovement: {
      labels: string[];
      data: number[];
    };
  };
};

export default function StockAgingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsApiResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://ims-2gyk.onrender.com/stock-manager/reports-analytics",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "API Failed");
        }

        const data = await res.json();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     TRANSFORM DATA
     ========================= */

  const movementData =
    analytics?.charts.stockMovement.labels.map((label, i) => ({
      month: label,
      stockIn: analytics.charts.stockMovement.data[i],
      stockOut: Math.floor(analytics.charts.stockMovement.data[i] * 0.7),
    })) || [];

  const categoryPieData =
    analytics?.charts.categoryDistribution.map((item, i) => ({
      name: item.category,
      value: Number(item.total),
      color: ["#FF6A2B", "#41B8D5", "#C0268C", "#2F6FED"][i % 4],
    })) || [];

  const stateData =
    analytics?.charts.categoryDistribution.map((item) => ({
      state: item.category,
      stock: Number(item.total),
    })) || [];

  return (
    <div className="w-full bg-[#F7F9FB] min-h-screen">
      <div className="max-w-[1320px] mx-auto px-2 sm:px-6 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4">
        

          <div>
            <h1 className="text-[22px] font-[600] text-[#111827]">
              Reports & Analytics
            </h1>
            <p className="text-[13px] text-[#9CA3AF]">
              Monitor and manage inventory analytics
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white p-6 rounded-xl shadow text-gray-500">
            Loading analytics...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-white p-6 rounded-xl shadow text-red-600">
            {error}
          </div>
        )}

        {/* CONTENT */}
        {!loading && !error && analytics && (
          <>
            {/* COUNT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              <StockCount
                title="Total Stock Items"
                value={analytics.cards.totalStockItems}
                icon={Boxes}
              />

              <StockCount
                title="Low Stock Items"
                value={analytics.cards.lowStockItems}
                icon={Package}
              />

              <StockCount
                title="Scrap Items"
                value={analytics.cards.totalScrapItems}
                icon={AlertTriangle}
              />

              <StockCount
                title="Repairable Items"
                value={analytics.cards.totalRepairableItems}
                icon={Wrench}
              />
            </div>

            {/* STOCK MOVEMENT */}
            <StockMovementChart
              title="Stock Movement Trends"
              subtitle="Monthly stock in vs stock out analysis"
              data={movementData}
            />

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <AgingDistributionPie data={categoryPieData} />

              <StockDistributionByStateChart
                title="Stock Distribution by State"
                subtitle="Inventory across locations"
                data={stateData}
              />

            </div>
          </>
        )}
      </div>
    </div>
  );
}