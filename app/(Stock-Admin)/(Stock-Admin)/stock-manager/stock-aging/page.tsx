"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Boxes, Package, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";

import StockCount from "../../Components/StockCounts";
import AgingDistributionPie from "./component/AginDistribution";
import CategoryBarChart from "./component/CategoryBarChart";
import StockAgingTable from "./component/StockAgingTable";
import StockDistributionByStateChart from "../report-anylysis/component/StockDistributionByStateChart";

type AgingApiResponse = {
  stats: {
    totalItems: number;
    freshStocks: number;
    critical: number;
    averageAging: string;
  };
  charts: {
    categoryDistribution: {
      category: string;
      total: string;
    }[];
    agingByCategory: {
      category: string;
      totalQuantity: string;
      averageAging: number | null;
    }[];
  };
  table: any[];
};

export default function StockAgingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [aging, setAging] = useState<AgingApiResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://ims-2gyk.onrender.com/stock-manager/aging-global",
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
        setAging(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     PREPARE PIE DATA
     ========================= */

  const agingPieData =
    aging?.charts?.categoryDistribution?.map((item, index) => ({
      name: item.category,
      value: Number(item.total),
      color: ["#FF6A2B", "#41B8D5", "#C0268C", "#2F6FED"][index % 4],
    })) || [];

  return (
    <div className="w-full bg-[#F7F9FB] min-h-screen">
      <div className="max-w-[1320px] mx-auto px-6 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[22px] font-[600] text-[#111827]">
              Global Stock Aging
            </h1>
            <p className="text-[13px] text-[#9CA3AF]">
              Aging analytics from backend API
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white p-6 rounded-xl shadow text-gray-500">
            Loading aging data...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-white p-6 rounded-xl shadow text-red-600">
            {error}
          </div>
        )}

        {/* CONTENT */}
        {!loading && !error && aging && (
          <>
            {/* COUNT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StockCount
                title="Total Items"
                value={aging.stats.totalItems}
                icon={Boxes}
              />

              <StockCount
                title="Fresh Stocks"
                value={aging.stats.freshStocks}
                icon={Package}
              />

              <StockCount
                title="Critical"
                value={aging.stats.critical}
                icon={AlertTriangle}
              />

              <StockCount
                title="Average Aging"
                value={aging.stats.averageAging}
                icon={Wrench}
              />
            </div>

            {/* CHART SECTION */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* PIE CHART */}
              <AgingDistributionPie data={agingPieData} />

              {/* BAR CHART */}
              <CategoryBarChart
                data={aging.charts.agingByCategory.map((item) => ({
                  category: item.category,
                  totalQuantity: Number(item.totalQuantity),
                }))}
              />

            </div>

            {/* TABLE */}
            <StockAgingTable data={aging.table} />
          </>
        )}
      </div>
    </div>
  );
}