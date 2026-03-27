"use client";

import { useMemo } from "react";
import { useApp } from "../../../context/InventoryManagerDashboard";
import InventoryOverviewCards from "../../Components/InventoryOverviewCards";
import StockDistributionByStateChart from "../../Components/StockCategoryBarChart";
import HierarchyTable from "../../Components/HierarchyTable";
import {
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/app/lib/inventoryDashboardApi";

export default function Dashboard() {
  const { dashboard, loading, error } = useApp();

  const inventoryRows = useMemo(() => {
    return (
      dashboard?.inventoryTable ||
      dashboard?.tableData ||
      dashboard?.inventory ||
      dashboard?.items ||
      dashboard?.rows ||
      []
    );
  }, [dashboard]);

  const chartData = useMemo(() => {
    return inventoryRows.slice(0, 10).map((item: any, index: number) => ({
      state:
        item.itemName ||
        item.name ||
        item.category ||
        item.categories ||
        `Item ${index + 1}`,
      stock: toNumber(
        item.currentStock ||
          item.stock ||
          item.totalStock ||
          item.stockValue ||
          item.totalValue ||
          0
      ),
    }));
  }, [inventoryRows]);

  const summary = useMemo(() => {
    return {
      currentStock:
        toNumber(dashboard?.summary?.currentStock) ||
        toNumber(dashboard?.stats?.totalStock) ||
        toNumber(dashboard?.cards?.totalStock) ||
        toNumber(dashboard?.cards?.totalStockItems) ||
        inventoryRows.reduce(
          (sum: number, item: any) =>
            sum + toNumber(item.currentStock || item.stock || 0),
          0
        ),

      totalStockValue:
        toNumber(dashboard?.summary?.totalStockValue) ||
        toNumber(dashboard?.stats?.totalStockValue) ||
        toNumber(dashboard?.cards?.totalStockValue) ||
        inventoryRows.reduce(
          (sum: number, item: any) =>
            sum +
            toNumber(
              item.totalValue || item.stockValue || item.amount || item.value || 0
            ),
          0
        ),

      totalItems:
        toNumber(dashboard?.summary?.totalItems) ||
        toNumber(dashboard?.stats?.totalItems) ||
        toNumber(dashboard?.cards?.totalItems) ||
        inventoryRows.length ||
        0,

      stockIn:
        toNumber(dashboard?.summary?.stockIn) ||
        toNumber(dashboard?.stats?.stockIn) ||
        inventoryRows.reduce(
          (sum: number, item: any) => sum + toNumber(item.stockIn || 0),
          0
        ),

      stockOut:
        toNumber(dashboard?.summary?.stockOut) ||
        toNumber(dashboard?.stats?.stockOut) ||
        inventoryRows.reduce(
          (sum: number, item: any) => sum + toNumber(item.stockOut || 0),
          0
        ),
    };
  }, [dashboard, inventoryRows]);

  const tableRows = useMemo(() => {
    return inventoryRows.map((item: any, index: number) => ({
      id: item.id ?? index + 1,
      itemName: item.itemName || item.name || "NA",
      category: item.categories || item.category || "NA",
      hsnCode: item.hsnCode || item.hsn || "-",
      grnNo: item.grnNo || item.grn || "-",
      poNumber: item.poNumber || item.po || "-",
      currentStock: toNumber(item.currentStock || item.stock || 0),
      stockIn: toNumber(item.stockIn || 0),
      stockOut: toNumber(item.stockOut || 0),
      scrap: toNumber(item.scrap || 0),
      totalValue: toNumber(
        item.totalValue || item.stockValue || item.amount || item.value || 0
      ),
      status:
        item.status === "GOOD"
          ? "Good"
          : item.status === "DAMAGED"
          ? "Damaged"
          : item.status === "REPAIRABLE"
          ? "Repairable"
          : item.status || "Good",
      dispatchDate: item.dispatchDate || item.dispatch || "-",
      deliveryDate: item.deliveryDate || item.delivery || "-",
    }));
  }, [inventoryRows]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-5 lg:px-6 animate-pulse">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
                  <div className="h-8 w-20 rounded bg-[#E5E7EB]" />
                  <div className="h-3 w-16 rounded bg-[#E5E7EB]" />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-4 space-y-2">
              <div className="h-5 w-44 rounded bg-[#E5E7EB]" />
              <div className="h-4 w-56 rounded bg-[#E5E7EB]" />
            </div>
            <div className="h-[320px] w-full rounded-[18px] bg-[#E5E7EB]" />
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#E6ECF2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="h-5 w-32 rounded bg-[#E5E7EB]" />
                <div className="mt-2 h-4 w-44 rounded bg-[#E5E7EB]" />
              </div>

              <div className="h-8 w-20 rounded bg-[#E5E7EB]" />
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="bg-[#F3F6F9]">
                  <tr>
                    {[...Array(7)].map((_, index) => (
                      <th key={index} className="px-6 py-4 text-left">
                        <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-t border-[#EDF2F7]"
                    >
                      {[...Array(7)].map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                          <div className="h-4 w-full max-w-[120px] rounded bg-[#E5E7EB]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-5 lg:px-6">
        <InventoryOverviewCards summary={summary} />

        <StockDistributionByStateChart
          title="Stock Distribution By Items"
          subtitle="Top inventory items by stock/value"
          data={chartData}
        />

        <HierarchyTable
          title="State Overview"
          subtitle="Inventory summary by state"
          data={tableRows}
          getViewHref={(row) =>
            `/inventory-manager/Branches/${encodeURIComponent(
              String(row.itemName || row.name || "")
            )}`
          }
          columns={[
            {
              key: "itemName",
              title: "Item Name",
              render: (row) => row.itemName || "-",
            },
            {
              key: "category",
              title: "Category",
              render: (row) => row.category || "-",
            },
            {
              key: "currentStock",
              title: "Current Stock",
              render: (row) => formatNumber(toNumber(row.currentStock)),
            },
            {
              key: "stockIn",
              title: "Stock In",
              render: (row) => formatNumber(toNumber(row.stockIn)),
            },
            {
              key: "stockOut",
              title: "Stock Out",
              render: (row) => formatNumber(toNumber(row.stockOut)),
            },
            {
              key: "totalValue",
              title: "Total Value",
              render: (row) => formatCurrency(toNumber(row.totalValue)),
            },
          ]}
        />
      </div>
    </div>
  );
}