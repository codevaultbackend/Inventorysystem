"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  Wrench,
  Boxes,
} from "lucide-react";


import StockCategoryBarChart from "../../../../../../Components/StockCategoryBarChart";
import StockCount from "../../../../../../Components/StockCounts";
import StockLineChart from "../../../../../../Components/StockLineChart";
import InventoryTable from "../../../../../../Components/inventoryTable";
import { FaChevronLeft } from "react-icons/fa";

export default function BranchDashboardPage() {
  const params = useParams();
  const router = useRouter();

  // Get branchId and itemId from URL
  const branchId = params?.branchId as string;
  const itemId = params?.itemId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [branchName, setBranchName] = useState("");

  const [counts, setCounts] = useState({
    total: 0,
    low: 0,
    scrap: 0,
    transit: 0,
  });

  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  // ================= FETCH =================
  useEffect(() => {
    if (!branchId || !itemId) return;

    const fetchBranchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        // Pass both branchId and itemId dynamically
        const res = await fetch(
          
          `https://ims-2gyk.onrender.com/stock-manager/analytics/item/${branchId}/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch branch data");

        const data = await res.json();
        console.log("API RESPONSE:", data);

        // ================= Branch Name =================
        setBranchName(
          data.branch_name || data.branchId || `Branch ${branchId}`
        );

        // ================= Stats =================
        const stats = data.stats || {};
        setCounts({
          total: stats.totalStock || 0,
          low: stats.lowStock || 0,
          scrap: stats.damagedStock || 0,
          transit: 0,
        });

        // ================= Charts =================
        const catChart = data.charts?.statusChart || [];
        setCategoryData(
          catChart.length
            ? catChart.map((c: any) => ({
                name: c.status || "NA",
                currentStock: Number(c.qty || 0),
                stockIn: Number(c.stockIn || 0),
                stockOut: Number(c.stockOut || 0),
                aging: Number(c.aging || 0),
              }))
            : []
        );

        const trendChart = data.charts?.monthlyTrend || [];
        setLineData(
          trendChart.length
            ? trendChart.map((t: any, i: number) => ({
                date: t.month || `#${i + 1}`,
                stockIn: Number(t.stockIn || 0),
                stockOut: Number(t.stockOut || 0),
              }))
            : []
        );

        // ================= Table =================
        setTableData(
          data.item
            ? [
                {
                  item: data.item,
                  category: "NA",
                  quantity: stats.totalStock || 0,
                  rate: 0,
                  value: stats.totalValue || 0,
                  hsn: "NA",
                  grn: "NA",
                  batch: "NA",
                  status: "NA",
                  action: false,
                },
              ]
            : []
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load branch data");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchItem();
  }, [branchId, itemId]);

  const columns = [
    { key: "item", label: "Item" },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Qty" },
    { key: "rate", label: "Rate" },
    { key: "value", label: "Value" },
    { key: "hsn", label: "HSN" },
    { key: "grn", label: "GRN" },
    { key: "batch", label: "Batch" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading branch item data...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="w-full bg-[#F7F9FB] min-h-screen">
      <div className="max-w-[1320px] mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center"
          >
            <FaChevronLeft />
          </button>
          <div>
            <h1 className="text-[22px] font-semibold">
              {branchName ? `Branch : ${branchName}` : `Branch ${branchId}`}
            </h1>
            <p className="text-[13px] text-gray-400">Branch Inventory</p>
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StockCount title="Total Stock" value={counts.total} icon={Boxes} />
          <StockCount title="Low Stock" value={counts.low} icon={AlertTriangle} />
          <StockCount title="Damaged" value={counts.scrap} icon={Wrench} />
          <StockCount title="Transit" value={counts.transit} icon={Package} />
        </div>

        {/* Charts */}
        <StockCategoryBarChart title="Stock Categories" data={categoryData} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <StockLineChart title="Stock Aging" data={lineData} />
          <StockLineChart title="Stock Movement" data={lineData} />
        </div>

        {/* Table */}
        <InventoryTable title="Stocks" columns={columns} data={tableData} />
      </div>
    </div>
  );
}