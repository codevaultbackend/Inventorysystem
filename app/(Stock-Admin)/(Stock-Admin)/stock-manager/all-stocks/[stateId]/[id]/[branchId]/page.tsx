"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, AlertTriangle, Wrench, Boxes } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";

import StockCategoryBarChart from "../../../../../Components/StockCategoryBarChart";
import StockCount from "../../../../../Components/StockCounts";
import StockLineChart from "../../../../../Components/StockLineChart";
import StockInventoryTable from "../../../../../Components/StockInventoryTable";

export default function BranchDashboardPage() {
  const params = useParams();
  const router = useRouter();

  const stateId = params?.stateId;
  const cityId = params?.id;
  const branchId = params?.branchId;

  const [loading, setLoading] = useState(true);
  const [branchName, setBranchName] = useState("");
  const [counts, setCounts] = useState({ total: 0, low: 0, scrap: 0, transit: 0 });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branchId) return;

    const fetchBranch = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://ims-2gyk.onrender.com/stock-manager/branchs/${branchId}`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );

        if (!res.ok) throw new Error("Failed to fetch branch data");

        const data = await res.json();

        setBranchName(data?.branch?.name || `Branch ${branchId}`);

        const stats = data?.stats || {};
        setCounts({
          total: Number(stats?.totalStock || 0),
          low: Number(stats?.lowStock || 0),
          scrap: Number(stats?.damagedStock || 0),
          transit: Number(stats?.transitStock || 0),
        });

        const cat = data?.charts?.categoryChart || [];
        setCategoryData(
          cat.map(c => ({
            name: c?.category || "NA",
            currentStock: Number(c?.qty || 0),
            stockIn: Number(c?.stockIn || 0),
            stockOut: Number(c?.stockOut || 0),
            aging: Number(c?.aging || 0),
          }))
        );

        const trend = data?.charts?.monthlyTrend || [];
        setLineData(
          trend.map((t, i) => ({
            date: t?.month || `#${i + 1}`,
            stockIn: Number(t?.stockIn || 0),
            stockOut: Number(t?.stockOut || 0),
          }))
        );

        const stocks = data?.stocks || [];
        if (!stocks.length) setError("No items found in this branch");

        setTableData(
          stocks.map(s => ({
            branch: s?.item || "NA",
            current: Number(s?.quantity || 0),
            stockIn: Number(s?.stockIn || 0),
            stockOut: Number(s?.stockOut || 0),
            condition: s?.status ? s.status.charAt(0) + s.status.slice(1).toLowerCase() : "Good",
            action: true,
            itemId: s?.id,
          }))
        );
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load branch data");
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [branchId]);

  const columns = [
    { key: "branch", label: "Item" },
    { key: "current", label: "Current Stock" },
    { key: "stockIn", label: "Stock IN" },
    { key: "stockOut", label: "Stock OUT" },
    { key: "condition", label: "Condition" },
    { key: "action", label: "Action" },
  ];

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen text-gray-500">
      Loading branch data...
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen text-red-500">
      {error}
    </div>
  );

  return (
    <div className="w-full bg-[#F7F9FB] min-h-screen">
      <div className="max-w-[1320px] mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col max-w-[768px]:flex-row sm:items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center"
          >
            <FaChevronLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[22px] font-semibold break-words">{branchName}</h1>
            <p className="text-[13px] text-gray-400">Branch Inventory</p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StockCount title="Total Stock" value={counts.total} icon={Boxes} />
          <StockCount title="Low Stock" value={counts.low} icon={AlertTriangle} />
          <StockCount title="Damaged" value={counts.scrap} icon={Wrench} />
          <StockCount title="Transit" value={counts.transit} icon={Package} />
        </div>

        {/* CHARTS */}
        <StockCategoryBarChart title="Stock Categories" data={categoryData} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          <StockLineChart title="Stock Aging" data={lineData} />
          <StockLineChart title="Stock Movement" data={lineData} />
        </div>

        {/* TABLE */}
        <StockInventoryTable
          title="Stocks"
          columns={columns}
          data={tableData}
          onView={(row) => {
            if (!row?.itemId) return;
            router.push(`/stock-manager/all-stocks/${stateId}/${cityId}/${branchId}/${row.itemId}`);
          }}
        />
      </div>
    </div>
  );
}