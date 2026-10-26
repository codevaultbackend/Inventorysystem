"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, AlertTriangle, Wrench, Boxes } from "lucide-react";

import StockCategoryBarChart from "../../../../Components/StockCategoryBarChart";
import StockCount from "../../../../Components/StockCounts";
import StockLineChart from "../../../../Components/StockLineChart";
import StockInventoryTable from "../../../../Components/StockInventoryTable";
import { FaChevronLeft } from "react-icons/fa";

export default function CityDashboardPage() {
  const params = useParams();
  const router = useRouter();

  const stateId = params?.stateId as string;
  const cityIdRaw = params?.id as string;
  const cityId = decodeURIComponent(cityIdRaw || "");

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);

  const [counts, setCounts] = useState({ total: 0, low: 0, scrap: 0, transit: 0 });
  const [tableData, setTableData] = useState<any[]>([]);

  const capitalize = (text: string) => text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  useEffect(() => {
    if (!cityId) { setLoading(false); return; }

    const fetchCityBranches = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        const res = await fetch(
          `https://ims-2gyk.onrender.com/stock-manager/locations/${capitalize(cityId)}`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );

        if (!res.ok) throw new Error("Failed to fetch branch data");

        const data = await res.json();
        const list = data?.branches || [];
        setBranches(list);

        // Counts
        const total = list.reduce((sum, b) => sum + Number(b.currentStock || 0), 0);
        const damaged = list.reduce((sum, b) => sum + Number(b.damagedStock || 0), 0);
        const repair = list.reduce((sum, b) => sum + Number(b.repairableStock || 0), 0);

        setCounts({ total, low: damaged, scrap: repair, transit: 0 });

        // Table
        const table = list.map((b: any) => ({
          branch: b?.name ?? "NA",
          branchId: b?.id,
          current: b?.currentStock ?? 0,
          stockIn: b?.currentStock ?? 0,
          stockOut: b?.damagedStock ?? 0,
          condition:
            Number(b?.damagedStock) > 0 ? "Damaged" :
            Number(b?.repairableStock) > 0 ? "Repairable" :
            "Good",
          action: true,
        }));

        setTableData(table);
      } catch (err) {
        console.error("City fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCityBranches();
  }, [cityId]);

  const columns = [
    { key: "branch", label: "Branch Name" },
    { key: "current", label: "Current Stock" },
    { key: "stockIn", label: "Stock IN" },
    { key: "stockOut", label: "Stock OUT" },
    { key: "condition", label: "Condition" },
    { key: "action", label: "Action" },
  ];

  const categoryData = branches.map(b => ({
    name: b.name,
    currentStock: Number(b.currentStock || 0),
    stockIn: Number(b.currentStock || 0),
    stockOut: Number(b.damagedStock || 0),
    aging: 0,
  }));

  const lineData = branches.map((b, i) => ({
    date: `#${i + 1}`,
    stockIn: Number(b.currentStock || 0),
    stockOut: Number(b.damagedStock || 0),
  }));

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading branch dashboard...</div>;

  return (
    <div className="w-full bg-[#F7F9FB] min-h-screen">
      <div className="max-w-[1320px] mx-auto py-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
           <FaChevronLeft />
          </button>
          <div>
            <h1 className="text-[22px] font-[600] capitalize">{cityId} City</h1>
            <p className="text-[13px] text-gray-400">Detailed branch analytics and inventory</p>
          </div>
        </div>

        {/* COUNTS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StockCount title="Total Stock Items" value={counts.total} icon={Boxes} />
          <StockCount title="Damaged Stock" value={counts.low} icon={AlertTriangle} />
          <StockCount title="Repairable Stock" value={counts.scrap} icon={Wrench} />
          <StockCount title="Transit Items" value={counts.transit} icon={Package} />
        </div>

        {/* CHARTS */}
        <StockCategoryBarChart title="Stock Analytics by Categories" data={categoryData} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <StockLineChart title="Stock Aging Analytics" data={lineData} />
          <StockLineChart title="Stock Movement Trends" data={lineData} />
        </div>

        {/* TABLE */}
        <StockInventoryTable
          title="Complete Stock Inventory"
          columns={columns}
          data={tableData}
          onView={(row) => {
            const selectedBranchId = row.branchId;
            router.push(`/stock-manager/all-stocks/${stateId}/${cityId}/${selectedBranchId}`);
          }}
        />
      </div>
    </div>
  );
}