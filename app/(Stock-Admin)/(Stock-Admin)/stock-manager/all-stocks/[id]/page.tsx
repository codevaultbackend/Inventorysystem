"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, AlertTriangle, Wrench, Boxes } from "lucide-react";

import StockCategoryBarChart from "../../../Components/StockCategoryBarChart";
import StockCount from "../../../Components/StockCounts";
import StockLineChart from "../../../Components/StockLineChart";
import StockInventoryTable from "../../../Components/StockInventoryTable";

export default function BranchDashboardPage() {

  const params = useParams();
  const router = useRouter();

  const branchId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);

  const [counts, setCounts] = useState({
    total: 0,
    low: 0,
    scrap: 0,
    transit: 0,
  });

  const [tableData, setTableData] = useState([]);

  /* ================= CAPITALIZE ================= */

  const capitalize = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  /* ================= FETCH ================= */

  useEffect(() => {

    if (!branchId) return;

    const fetchBranch = async () => {

      try {

        setLoading(true);

        const token = localStorage.getItem("token");

        const branchName = capitalize(branchId);

        const res = await fetch(
          `https://ims-2gyk.onrender.com/stock-manager/locations/${branchName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        console.log("API", data);

        const list = data?.branches || [];

        setBranches(list);

        /* ================= COUNTS ================= */

        const total = list.reduce(
          (sum: number, b: any) =>
            sum + Number(b.currentStock || 0),
          0
        );

        const damaged = list.reduce(
          (sum: number, b: any) =>
            sum + Number(b.damagedStock || 0),
          0
        );

        const repair = list.reduce(
          (sum: number, b: any) =>
            sum + Number(b.repairableStock || 0),
          0
        );

        setCounts({
          total,
          low: damaged,
          scrap: repair,
          transit: 0,
        });

        /* ================= TABLE ================= */

        setTableData(
          list.map((b: any) => ({
            branch: b?.name ?? "NA",
            current: b?.currentStock ?? "NA",
            stockIn: b?.currentStock ?? "NA",
            stockOut: b?.damagedStock ?? "0",
            condition:
              Number(b?.damagedStock) > 0
                ? "Damaged"
                : Number(b?.repairableStock) > 0
                ? "Repairable"
                : "Good",
            action: true,
          }))
        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    fetchBranch();

  }, [branchId]);


  /* ================= COLUMNS ================= */

  const columns = [
    { key: "branch", label: "Branch Name" },
    { key: "current", label: "Current Stock" },
    { key: "stockIn", label: "Stock IN" },
    { key: "stockOut", label: "Stock OUT" },
    { key: "condition", label: "Condition" },
    { key: "action", label: "Action" },
  ];


  /* ================= CHART DUMMY ================= */

  const categoryData = branches.map((b: any) => ({
    name: b.name,
    currentStock: Number(b.currentStock || 0),
    stockIn: Number(b.currentStock || 0),
    stockOut: Number(b.damagedStock || 0),
    aging: 0,
  }));


  const lineData = branches.map((b: any, i) => ({
    date: `#${i + 1}`,
    stockIn: Number(b.currentStock || 0),
    stockOut: Number(b.damagedStock || 0),
  }));


  /* ================= UI ================= */

  return (

    <div className="w-full bg-[#F7F9FB] min-h-screen">

      <div className="max-w-[1320px] mx-auto px-6 py-6 space-y-6">

        {/* TITLE */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>

          <div>

            <h1 className="text-[22px] font-[600] capitalize">
              {branchId} Branch
            </h1>

            <p className="text-[13px] text-gray-400">
              Detailed branch analytics and inventory
            </p>

          </div>

        </div>


        {/* COUNTS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <StockCount
            title="Total Stock Items"
            value={counts.total}
            icon={Boxes}
          />

          <StockCount
            title="Damaged Stock"
            value={counts.low}
            icon={AlertTriangle}
          />

          <StockCount
            title="Repairable Stock"
            value={counts.scrap}
            icon={Wrench}
          />

          <StockCount
            title="Transit Items"
            value={counts.transit}
            icon={Package}
          />

        </div>


        {/* BAR */}

        <StockCategoryBarChart
          title="Stock Analytics by Categories"
          data={categoryData}
        />


        {/* LINES */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          <StockLineChart
            title="Stock Aging Analytics"
            data={lineData}
          />

          <StockLineChart
            title="Stock Movement Trends"
            data={lineData}
          />

        </div>


        {/* TABLE */}

        <StockInventoryTable
          title="Complete Stock Inventory"
          columns={columns}
          data={tableData}
        />

      </div>

    </div>

  );

}