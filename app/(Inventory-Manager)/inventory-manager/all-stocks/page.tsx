"use client";

import { useApp } from "../../../context/InventoryManagerDashboard";
import DashboardTable from "../Dashboard/Components/DashboardTable";

export default function AllStocksPage() {
  const { dashboard, loading, error } = useApp();

  const num = (v: any) => Number(v || 0);

  /* ================= FIXED TABLE DATA ================= */
  const tableData =
    dashboard?.inventoryTable?.map((item: any, index: number) => ({
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

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        Loading stocks...
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-6">

        <DashboardTable
          title="Complete Stock Inventory"
          data={tableData}
          onExport={() => console.log("Export clicked")}
        />

      </div>
    </div>
  );
}