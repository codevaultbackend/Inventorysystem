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

export default function InventoryBranchesPage() {
  const { dashboard, loading, error } = useApp();

  const stateRows = useMemo(() => {
    return (
      dashboard?.states ||
      dashboard?.stateBreakdown ||
      dashboard?.data ||
      dashboard?.rows ||
      []
    );
  }, [dashboard]);

  const chartData = useMemo(() => {
    return stateRows.map((item: any) => ({
      state: item.state || item.name || "NA",
      stock: toNumber(
        item.totalStockValue ||
          item.totalValue ||
          item.stockValue ||
          item.totalStock ||
          0
      ),
    }));
  }, [stateRows]);

  const summary = {
    currentStock:
      toNumber(dashboard?.summary?.currentStock) ||
      toNumber(dashboard?.stats?.totalStock) ||
      toNumber(dashboard?.cards?.totalStock) ||
      0,
    totalStockValue:
      toNumber(dashboard?.summary?.totalStockValue) ||
      toNumber(dashboard?.stats?.totalStockValue) ||
      toNumber(dashboard?.cards?.totalStockValue) ||
      0,
    totalItems:
      toNumber(dashboard?.summary?.totalItems) ||
      toNumber(dashboard?.stats?.totalItems) ||
      stateRows.length ||
      0,
    stockIn:
      toNumber(dashboard?.summary?.stockIn) ||
      toNumber(dashboard?.stats?.stockIn) ||
      0,
    stockOut:
      toNumber(dashboard?.summary?.stockOut) ||
      toNumber(dashboard?.stats?.stockOut) ||
      0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-5 lg:px-6 animate-pulse">
          <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="h-8 w-[220px] rounded-md bg-[#E5E7EB]" />
            <div className="mt-2 h-4 w-[280px] rounded-md bg-[#E5E7EB]" />
          </div>

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
                    {[...Array(6)].map((_, index) => (
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
                      {[...Array(6)].map((_, colIndex) => (
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
      <HierarchyTable
        title="State Overview"
        subtitle="Inventory summary by state"
        data={stateRows}
        getViewHref={(row) =>
          `/inventory-manager/Branches/${encodeURIComponent(
            String(row.state || row.name || "")
          )}`
        }
        columns={[
          {
            key: "state",
            title: "State",
            render: (row) => row.state || row.name || "-",
          },
          {
            key: "totalBranches",
            title: "Total Branches",
            render: (row) =>
              formatNumber(toNumber(row.totalBranches || row.branchCount)),
          },
          {
            key: "totalStock",
            title: "Total Stock",
            render: (row) =>
              formatNumber(toNumber(row.totalStock || row.stock)),
          },
          {
            key: "totalValue",
            title: "Total Value",
            render: (row) =>
              formatCurrency(
                toNumber(
                  row.totalValue || row.totalStockValue || row.stockValue
                )
              ),
          },
          {
            key: "currentStock",
            title: "Current Stock",
            render: (row) =>
              formatNumber(toNumber(row.currentStock || row.availableStock)),
          },
        ]}
      />
    </div>
  );
}