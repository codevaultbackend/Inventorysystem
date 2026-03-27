"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InventoryOverviewCards from "../../../Components/InventoryOverviewCards";
import StockDistributionByStateChart from "../../../Components/StockCategoryBarChart";
import HierarchyTable from "../../../Components/HierarchyTable";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/app/lib/inventoryDashboardApi";

export default function InventoryStatePage() {
  const params = useParams();
  const router = useRouter();

  const stateName = decodeURIComponent((params?.state as string) || "");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStateDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await inventoryDashboardApi.get(
          `/combine/dashboard/state/${encodeURIComponent(stateName)}`
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
            "Failed to load state details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (stateName) {
      fetchStateDetails();
    }
  }, [router, stateName]);

  const branchRows = useMemo(() => {
    return (
      data?.branches ||
      data?.stateData?.branches ||
      data?.data?.branches ||
      []
    );
  }, [data]);

  const chartData = useMemo(() => {
    const raw =
      data?.charts?.branchValueChart ||
      data?.branchValueChart ||
      branchRows.map((branch: any) => ({
        label: branch.branchName,
        value: branch.totalValue,
      }));

    return raw.map((item: any) => ({
      state: item.label || item.branchName || "NA",
      stock: toNumber(item.value || item.totalValue || 0),
    }));
  }, [data, branchRows]);

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
      branchRows.length ||
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-5 lg:px-6 animate-pulse">
          <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="h-8 w-[220px] rounded-md bg-[#E5E7EB]" />
            <div className="mt-2 h-4 w-[260px] rounded-md bg-[#E5E7EB]" />
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
      <div className="mx-auto w-full max-w-[1440px] space-y-6 ">
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
          <h1 className="text-[28px] font-semibold text-[#111827] sm:text-[32px]">
            {data?.state || stateName}
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280] sm:text-[14px]">
            State wise branch inventory summary
          </p>
        </div>

        <InventoryOverviewCards summary={summary} />

        <StockDistributionByStateChart
          title="Branch Value Distribution"
          subtitle="Branch wise stock value in this state"
          data={chartData}
        />

        <HierarchyTable
          title="Branch Overview"
          subtitle="Branch wise inventory hierarchy"
          data={branchRows}
          getViewHref={(row) =>
            `/inventory-manager/Branches/${encodeURIComponent(
              stateName
            )}/${encodeURIComponent(String(row.branchId || row.id || ""))}`
          }
          columns={[
            {
              key: "branchName",
              title: "Branch Name",
              render: (row) => row.branchName || row.name || "-",
            },
            {
              key: "totalStock",
              title: "Total Stock",
              render: (row) => formatNumber(toNumber(row.totalStock || row.stock)),
            },
            {
              key: "totalValue",
              title: "Total Value",
              render: (row) =>
                formatCurrency(
                  toNumber(row.totalValue || row.stockValue || row.totalStockValue)
                ),
            },
            {
              key: "currentStock",
              title: "Current Stock",
              render: (row) =>
                formatNumber(toNumber(row.currentStock || row.availableStock)),
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
          ]}
        />
      </div>
    </div>
  );
}