"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InventoryOverviewCards from "../../../../Components/InventoryOverviewCards";
import StockCategoryBarChart from "../../../../Components/StockCategoryBarChart";
import HierarchyTable from "../../../../Components/HierarchyTable";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
  slugifyText,
} from "@/app/lib/inventoryDashboardApi";

export default function InventoryBranchPage() {
  const params = useParams();
  const router = useRouter();

  const stateName = decodeURIComponent((params?.state as string) || "");
  const branchId = decodeURIComponent((params?.branchId as string) || "");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await inventoryDashboardApi.get(
          `/combine/dashboard/branch-id/${encodeURIComponent(branchId)}`
        );

        if (res.data?.success) {
          setData(res.data);
        } else {
          throw new Error(res.data?.message || "Invalid API response");
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.clear();
          router.replace("/login");
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load branch details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (branchId) {
      fetchBranchDetails();
    }
  }, [branchId, router]);

  const summary = {
    currentStock:
      toNumber(data?.summary?.currentStock) ||
      toNumber(data?.stats?.totalStock) ||
      0,
    totalStockValue:
      toNumber(data?.summary?.totalStockValue) ||
      toNumber(data?.stats?.totalStockValue) ||
      0,
    totalItems:
      toNumber(data?.summary?.totalItems) ||
      toNumber(data?.stats?.totalItems) ||
      toNumber(data?.allItems?.length) ||
      0,
    stockIn:
      toNumber(data?.summary?.stockIn) ||
      toNumber(data?.stats?.stockIn) ||
      0,
    stockOut:
      toNumber(data?.summary?.stockOut) ||
      toNumber(data?.stats?.stockOut) ||
      0,
  };

  const categoryChartData = useMemo(() => {
    const raw =
      data?.charts?.categoryDistribution ||
      data?.categoryDistribution ||
      [];

    return raw.map((item: any) => ({
      name: item.category || item.name || "NA",
      current: toNumber(item.total || item.value || item.qty),
      in: 0,
      out: 0,
      aging: 0,
    }));
  }, [data]);

  const itemRows = useMemo(() => {
    const raw = data?.allItems || data?.items || [];

    return raw.map((item: any) => ({
      itemName: item.item || item.itemName || item.name || "NA",
      slugItemName: slugifyText(item.item || item.itemName || item.name || ""),
      totalQty: toNumber(item.totalQty || item.qty || item.totalStock),
      totalValue: toNumber(item.totalValue || item.value || item.stockValue),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-5 lg:px-6 animate-pulse">
          <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="h-8 w-[220px] rounded-md bg-[#E5E7EB]" />
            <div className="mt-2 h-4 w-[240px] rounded-md bg-[#E5E7EB]" />
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
                    {[...Array(4)].map((_, index) => (
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
                      {[...Array(4)].map((_, colIndex) => (
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
      <div className="mx-auto w-full max-w-[1440px] space-y-6 ">
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
          <h1 className="text-[28px] font-semibold text-[#111827] sm:text-[32px]">
            {data?.branch?.name || data?.branchName || "Branch Details"}
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280] sm:text-[14px]">
            Branch wise inventory analytics
          </p>
        </div>

        <InventoryOverviewCards summary={summary} />

        <StockCategoryBarChart
          title="Category Distribution"
          subtitle="Category wise stock summary"
          data={categoryChartData}
        />

        <HierarchyTable
          title="Inventory Items"
          subtitle="Item wise inventory summary"
          data={itemRows}
          getViewHref={(row) =>
            `/inventory-manager/Branches/${encodeURIComponent(
              stateName
            )}/${encodeURIComponent(branchId)}/${encodeURIComponent(
              row.slugItemName
            )}`
          }
          columns={[
            {
              key: "itemName",
              title: "Item Name",
              render: (row) => row.itemName || "-",
            },
            {
              key: "totalQty",
              title: "Total Qty",
              render: (row) => formatNumber(toNumber(row.totalQty)),
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