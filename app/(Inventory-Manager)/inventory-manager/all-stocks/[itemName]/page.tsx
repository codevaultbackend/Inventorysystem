"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InventoryOverviewCards from "../../../Components/InventoryOverviewCards";
import StockCategoryBarChart from "../../../Components/StockCategoryBarChart";
import HierarchyTable from "../../../Components/HierarchyTable";
import { useAuth } from "@/app/context/AuthContext";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
  deslugifyText,
} from "@/app/lib/inventoryDashboardApi";

export default function InventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const branchId = String(
    user?.branch_id ||
      user?.branchId ||
      user?.branch?.id ||
      user?.branches?.[0] ||
      ""
  );

  const itemSlug =
    decodeURIComponent(
      (params?.itemName as string) ||
        (params?.branchId as string) ||
        ""
    ) || "";

  const itemName = deslugifyText(itemSlug);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError("");

        if (!branchId) {
          throw new Error("Invalid branch id");
        }

        if (!itemName) {
          throw new Error("Invalid item name");
        }

        const res = await inventoryDashboardApi.get(
          `/combine/dashboard/item/${encodeURIComponent(
            branchId
          )}/${encodeURIComponent(itemName)}`
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
            "Failed to load item details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && branchId && itemName) {
      fetchItemDetails();
    } else if (!authLoading && !branchId) {
      setError("Invalid branch id");
      setLoading(false);
    }
  }, [branchId, itemName, router, authLoading]);

  const summary = {
    currentStock:
      toNumber(data?.stats?.totalStock) ||
      toNumber(data?.summary?.currentStock) ||
      0,
    totalStockValue:
      toNumber(data?.stats?.totalValue) ||
      toNumber(data?.summary?.totalStockValue) ||
      0,
    totalItems:
      toNumber(data?.stats?.entries) ||
      toNumber(data?.summary?.totalItems) ||
      0,
    stockIn:
      toNumber(data?.stats?.stockIn) ||
      toNumber(data?.summary?.stockIn) ||
      0,
    stockOut:
      toNumber(data?.stats?.stockOut) ||
      toNumber(data?.summary?.stockOut) ||
      0,
  };

  const statusChartData = useMemo(() => {
    const raw = data?.charts?.statusChart || data?.statusChart || [];

    return raw.map((item: any) => ({
      name: item.status || item.name || "NA",
      current: toNumber(item.qty || item.value || item.total),
      in: 0,
      out: 0,
      aging: 0,
    }));
  }, [data]);

  const batchRows = useMemo(() => {
    const raw = data?.batches || data?.rows || [];

    return raw.map((item: any, index: number) => ({
      id: item.id || index + 1,
      batchNo: item.batch_no || item.batchNo || "-",
      qty: toNumber(item.qty),
      value: toNumber(item.value),
    }));
  }, [data]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-[#E5E7EB] bg-white text-[#64748B] shadow-sm">
        Loading item details...
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
            {data?.item || itemName}
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280] sm:text-[14px]">
            Item wise inventory analytics
          </p>
        </div>

        <InventoryOverviewCards summary={summary} />

        <StockCategoryBarChart
          title="Item Status Distribution"
          subtitle="Status wise item quantity"
          data={statusChartData}
        />

        <HierarchyTable
          title="Batch Overview"
          subtitle="Top batches for this item"
          data={batchRows}
          getViewHref={() => null}
          columns={[
            {
              key: "batchNo",
              title: "Batch No",
              render: (row) => row.batchNo || "-",
            },
            {
              key: "qty",
              title: "Qty",
              render: (row) => formatNumber(toNumber(row.qty)),
            },
            {
              key: "value",
              title: "Value",
              render: (row) => formatCurrency(toNumber(row.value)),
            },
          ]}
        />
      </div>
    </div>
  );
}