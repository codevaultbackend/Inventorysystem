"use client";

import {
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import StockCount from "../../Components/StockCounts";
import StockLineChart from "../../Components/StockLineChart";
import StockCategoryBarChart from "../../Components/StockCategoryBarChart";
import InventoryTable from "../../Components/inventoryTable";

import { useSuperStockAdmin } from "@/app/context/SuperStockAdminContext";

export default function Dashboard() {

  const { data = {}, loading, error, refresh } = useSuperStockAdmin();

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="text-red-600 mb-4">{error}</p>

          <button
            onClick={refresh}
            className="px-4 py-2 bg-black text-white rounded-xl"
          >
            Retry
          </button>

        </div>
      </div>
    );
  }

  /* ================= SAFE DATA ================= */

  const totalStock = Number(data?.totalStock || 0);
  const lowStock = Number(data?.lowStock || 0);
  const damagedStock = Number(data?.damagedStock || 0);
  const repairableStock = Number(data?.repairableStock || 0);

  const categoryChart = Array.isArray(data?.categoryChart)
    ? data.categoryChart
    : [];

  const movementData = Array.isArray(data?.movementData)
    ? data.movementData
    : [];

  const locations = Array.isArray(data?.locations)
    ? data.locations
    : [];

  /* ================= CATEGORY MAP ================= */

  const categoryData = categoryChart.map((c) => ({
    name: c?.name ?? "NA",
    current: Number(c?.currentStock ?? 0),
    in: Number(c?.stockIn ?? 0),
    out: Number(c?.stockOut ?? 0),
    aging: Number(c?.aging ?? 0),
  }));

  /* ================= MOVEMENT MAP ================= */

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sept","Oct","Nov","Dec"
  ];

  const movement = movementData.map((m, i) => {

    let label = `#${i + 1}`;

    if (m?.month) {

      const parts = m.month.split("-");
      const index = Number(parts[1]) - 1;

      label = monthNames[index] ?? m.month;

    }

    return {
      date: label,
      stockIn: Number(m?.stockIn ?? 0),
      stockOut: Number(m?.stockOut ?? 0),
    };

  });

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    { key: "branch", label: "Branch Name" },
    { key: "category", label: "Category" },
    { key: "hsn", label: "HSN Code" },
    { key: "current", label: "Current Stock" },
    { key: "stockIn", label: "Stock IN" },
    { key: "stockOut", label: "Stock OUT" },
    { key: "condition", label: "Condition" },
    { key: "action", label: "Action" },
  ];

  /* ================= TABLE DATA ================= */

  const locationTable = locations.map((l, i) => ({

    branch: l?.location ?? "NA",

    category: "Warehouse",

    hsn: l?.location ? `LOC-${i + 1}` : "NA",

    current: l?.totalStock ? Number(l.totalStock) : "NA",

    stockIn: l?.totalStock ? Number(l.totalStock) : "NA",

    stockOut: l?.totalStock
      ? Math.floor(Number(l.totalStock) / 2)
      : "NA",

    condition: "Good",

    action: true,

  }));

  /* ================= UI ================= */

  return (

    <div className="w-full bg-[#F7F9FB] min-h-screen">

      <div className="max-w-[1320px] mx-auto py-6  space-y-6">

        {/* COUNT CARDS */}

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <StockCount
            title="Total Stock Items"
            value={totalStock.toLocaleString()}
            icon={Users}
            iconBgColor="#E8F1FF"
          />

          <StockCount
            title="Low Stock Items"
            value={lowStock.toLocaleString()}
            icon={Package}
            iconBgColor="#EEF5FF"
          />

          <StockCount
            title="Damaged Stock"
            value={damagedStock.toLocaleString()}
            icon={AlertTriangle}
            iconBgColor="#FEE2E2"
          />

          <StockCount
            title="Repairable Stock"
            value={repairableStock.toLocaleString()}
            icon={TrendingUp}
            iconBgColor="#DCFCE7"
          />

        </div>

        {/* BAR CHART */}

        <StockCategoryBarChart
          title="Stock Category Overview"
          subtitle="Current stock, movement and aging"
          data={categoryData}
        />

        {/* LINE CHARTS */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          <StockLineChart
            title="Stock Aging Analytics"
            subtitle="Track sales and purchase trends"
            data={movement}
            lines={[
              { key: "stockIn", color: "#2563EB" }
            ]}
          />

          <StockLineChart
            title="Stock Movement Trends"
            subtitle="Track stock sale trends"
            data={movement}
            lines={[
              { key: "stockIn", color: "#2563EB" },
              { key: "stockOut", color: "#60A5FA" },
            ]}
          />

        </div>

        {/* TABLE */}

        <InventoryTable
          title="Complete Stock Inventory"
          columns={columns}
          data={locationTable}
          onAdd={() => console.log("Add")}
          onExport={() => console.log("Export")}
        />

      </div>

    </div>
  );
}