"use client";

import { useApp } from "../../../context/InventoryManagerDashboard";

import DashboardStats from "./Components/DashboardStats";
import DashboardCharts from "./Components/DashboardCharts";
import DashboardTable from "./Components/DashboardTable";

export default function Dashboard() {
  const { dashboard, loading, error } = useApp();

  if (loading)
    return (
      <div className="h-[400px] flex items-center justify-center text-sm text-gray-500">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  if (!dashboard) return null;

  const num = (v: any) => Number(v || 0);

  /* ================= KPI ================= */
  const kpi = {
    totalStock: num(dashboard.cards?.totalStockItems),
    lowStock: num(dashboard.cards?.transitItems),
    damagedStock: num(dashboard.agingChart?.damaged),
    repairableStock: num(dashboard.agingChart?.repairable),
  };

  /* ================= CHART ================= */
  const purchaseChartData =
    dashboard.purchaseChart?.map((item: any) => ({
      month: item.month,
      amount: num(item.amount),
    })) || [];

  /* ================= PIE ================= */
  const stockStatusData = [
    { name: "Available", value: num(dashboard.agingChart?.available) },
    { name: "Damaged", value: num(dashboard.agingChart?.damaged) },
    { name: "Repairable", value: num(dashboard.agingChart?.repairable) },
  ];

  /* ================= TABLE (FINAL FIX) ================= */
  const tableData =
    dashboard.inventoryTable?.map((item: any, index: number) => ({
      id: index,

      itemName: item.itemName || "NA",
      category: item.categories || "NA",
      hsn: item.hsnCode || "-",
      grn: item.grnNo || "-",
      po: item.poNumber || "-",

      stock: num(item.currentStock),
      stockIn: num(item.stockIn),
      stockOut: num(item.stockOut),
      scrap: num(item.scrap),

      dispatch: item.dispatchDate?.split("T")[0] || "-",
      delivery: item.deliveryDate?.split("T")[0] || "-",

      status:
        item.status === "GOOD"
          ? "Good"
          : item.status === "DAMAGED"
          ? "Damaged"
          : "Repairable",
    })) || [];

  return (
    <div className="min-h-screen w-full bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-6">

        <div className="space-y-6">

          <DashboardStats kpi={kpi} />

          <DashboardCharts
            purchaseChartData={purchaseChartData}
            stockStatusData={stockStatusData}
          />

          <DashboardTable data={tableData} />

        </div>

      </div>
    </div>
  );
}