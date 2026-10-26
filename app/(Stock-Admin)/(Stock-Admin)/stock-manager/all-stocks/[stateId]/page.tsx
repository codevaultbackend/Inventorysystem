"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, AlertTriangle, Wrench, Boxes } from "lucide-react";

import StockCategoryBarChart from "../../../Components/StockCategoryBarChart";
import StockCount from "../../../Components/StockCounts";
import StockLineChart from "../../../Components/StockLineChart";
import StockInventoryTable from "../../../Components/StockInventoryTable";
import { FaChevronLeft } from "react-icons/fa";

export default function StateDashboardPage() {
  const params = useParams();
  const router = useRouter();

  const stateId = params?.stateId as string;

  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState({
    total: 0,
    low: 0,
    scrap: 0,
    transit: 0,
  });

  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  const formatState = (text: string) => {
    return text?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  useEffect(() => {
    if (!stateId) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const stateName = formatState(stateId);

        /* ================= CHART API ================= */
        const graphRes = await fetch(
          "https://ims-2gyk.onrender.com/stock-manager/state-graph",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const graphData = await graphRes.json();

        /* ===== CARDS ===== */
        setCounts({
          total: graphData.cards?.totalStockItems || 0,
          low: graphData.cards?.lowStockItems || 0,
          scrap: graphData.cards?.scrapItems || 0,
          transit: graphData.cards?.transitItems || 0,
        });

        /* ===== CATEGORY CHART ===== */
        const categories = graphData?.charts?.categoryChart || [];
        setCategoryData(
          categories.map((c: any) => ({
            name: c.name,
            currentStock: c.currentStock,
            stockIn: c.stockIn,
            stockOut: c.stockOut,
            aging: c.aging,
          }))
        );

        /* ===== LINE CHART ===== */
        const movement = graphData?.charts?.stockMovement;
        if (movement?.labels && Array.isArray(movement.data)) {
          const lines = movement.labels.map((label: string, i: number) => ({
            date: label,
            stockIn: movement.data[i] || 0,
            stockOut: 0,
          }));
          setLineData(lines);
        }

        /* ================= CITY TABLE API ================= */
        const cityRes = await fetch(
          `https://ims-2gyk.onrender.com/stock-manager/city/${stateName}/cities`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const cityData = await cityRes.json();

        const table = (Array.isArray(cityData) ? cityData : [cityData]).map((c: any) => ({
          id: c.id, // this is needed to navigate to city page
          city: c.city,
          branch: `${c.city} Branch`,
          current: c.currentStock,
          stockIn: c.currentStock,
          stockOut: c.scrapItems,
          condition: "Good",
          action: true,
        }));
        setTableData(table);
      } catch (err) {
        console.error("State dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [stateId]);

  const columns = [
    { key: "city", label: "City" },
    { key: "current", label: "Current Stock" },
    { key: "stockIn", label: "Stock IN" },
    { key: "stockOut", label: "Stock OUT" },
    { key: "condition", label: "Condition" },
    { key: "action", label: "Action" },
  ];

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="w-full bg-[#F7F9FB] min-h-screen">
      <div className="max-w-[1320px] mx-auto py-6 space-y-6">
        {/* TITLE */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center"
          >
             <FaChevronLeft />
           
          </button>
          <div>
            <h1 className="text-[22px] font-semibold">{formatState(stateId)} Cities</h1>
            <p className="text-sm text-gray-400">Detailed city analytics</p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StockCount title="Total Stock Items" value={counts.total} icon={Boxes} />
          <StockCount title="Low Stock Items" value={counts.low} icon={AlertTriangle} />
          <StockCount title="Scrap Items" value={counts.scrap} icon={Wrench} />
          <StockCount title="Transit Items" value={counts.transit} icon={Package} />
        </div>

        {/* CATEGORY CHART */}
        <StockCategoryBarChart title="Stock by Categories" data={categoryData} />

        {/* LINE CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <StockLineChart title="Stock Analytics" data={lineData} />
          <StockLineChart title="Stock Movement" data={lineData} />
        </div>

        {/* TABLE */}
        <StockInventoryTable
          title="City Inventory"
          columns={columns}
          data={tableData}
          onView={(row) => {
            const citySlug = row.city.toLowerCase().replace(/\s/g, "-");
            router.push(`/stock-manager/all-stocks/${stateId}/${citySlug}`);
          }}
        />
      </div>
    </div>
  );
}