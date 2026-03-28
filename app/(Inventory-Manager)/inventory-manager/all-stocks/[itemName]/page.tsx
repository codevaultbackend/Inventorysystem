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

function getNumericBranchId(value: any): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "number" && !Number.isNaN(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const onlyNumber = trimmed.match(/\d+/)?.[0] || "";
    return onlyNumber && !Number.isNaN(Number(onlyNumber)) ? onlyNumber : "";
  }

  if (typeof value === "object") {
    return (
      getNumericBranchId(value.id) ||
      getNumericBranchId(value.branch_id) ||
      getNumericBranchId(value.branchId) ||
      ""
    );
  }

  return "";
}

function resolveBranchId(params: any, user: any): string {
  return (
    getNumericBranchId(params?.branchId) ||
    getNumericBranchId(params?.id) ||
    getNumericBranchId(user?.branch_id) ||
    getNumericBranchId(user?.branchId) ||
    getNumericBranchId(user?.branch?.id) ||
    getNumericBranchId(user?.branch?.branch_id) ||
    getNumericBranchId(user?.branches?.[0]?.id) ||
    getNumericBranchId(user?.branches?.[0]?.branch_id) ||
    getNumericBranchId(user?.branches?.[0]) ||
    ""
  );
}

function resolveItemSlug(params: any): string {
  return decodeURIComponent(
    String(
      params?.itemName ||
        params?.itemId ||
        params?.slug ||
        ""
    )
  ).trim();
}

function InventoryItemPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <div className="animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="h-8 w-[240px] rounded-xl bg-[#E5E7EB]" />
          <div className="mt-3 h-4 w-[180px] rounded-xl bg-[#F1F5F9]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-[90px] rounded bg-[#E5E7EB]" />
              <div className="mt-4 h-8 w-[120px] rounded bg-[#F1F5F9]" />
            </div>
          ))}
        </div>

        <div className="animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="h-5 w-[220px] rounded bg-[#E5E7EB]" />
          <div className="mt-2 h-4 w-[180px] rounded bg-[#F1F5F9]" />
          <div className="mt-6 h-[320px] rounded-[20px] bg-[#F8FAFC]" />
        </div>

        <div className="animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="h-5 w-[180px] rounded bg-[#E5E7EB]" />
          <div className="mt-2 h-4 w-[160px] rounded bg-[#F1F5F9]" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-14 rounded-[16px] bg-[#F8FAFC]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const routeBranchId = useMemo(
    () => getNumericBranchId(params?.branchId),
    [params]
  );

  const branchId = useMemo(
    () => resolveBranchId(params, user),
    [params, user]
  );

  const itemSlug = useMemo(() => resolveItemSlug(params), [params]);
  const itemName = useMemo(() => deslugifyText(itemSlug), [itemSlug]);

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
          `/combine/dashboard/item/${encodeURIComponent(branchId)}/${encodeURIComponent(itemName)}`
        );

        const responseData = res?.data;

        if (responseData?.success || responseData?.item || responseData?.stats) {
          setData(responseData);
        } else {
          throw new Error(responseData?.message || "Invalid API response");
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
    } else if (!authLoading && !itemName) {
      setError("Invalid item name");
      setLoading(false);
    }
  }, [authLoading, branchId, itemName, router]);

  const summary = useMemo(() => {
    return {
      currentStock:
        toNumber(data?.stats?.totalStock) ||
        toNumber(data?.summary?.currentStock) ||
        toNumber(data?.currentStock) ||
        0,
      totalStockValue:
        toNumber(data?.stats?.totalValue) ||
        toNumber(data?.summary?.totalStockValue) ||
        toNumber(data?.totalStockValue) ||
        0,
      totalItems:
        toNumber(data?.stats?.entries) ||
        toNumber(data?.summary?.totalItems) ||
        toNumber(data?.totalItems) ||
        0,
      stockIn:
        toNumber(data?.stats?.stockIn) ||
        toNumber(data?.summary?.stockIn) ||
        toNumber(data?.stockIn) ||
        0,
      stockOut:
        toNumber(data?.stats?.stockOut) ||
        toNumber(data?.summary?.stockOut) ||
        toNumber(data?.stockOut) ||
        0,
    };
  }, [data]);

  const statusChartData = useMemo(() => {
    const raw = data?.charts?.statusChart || data?.statusChart || [];

    return Array.isArray(raw)
      ? raw.map((item: any) => ({
          name: item?.status || item?.name || "NA",
          current: toNumber(item?.qty || item?.value || item?.total),
          in: 0,
          out: 0,
          aging: 0,
        }))
      : [];
  }, [data]);

  const batchRows = useMemo(() => {
    const raw = data?.batches || data?.rows || [];

    return Array.isArray(raw)
      ? raw.map((item: any, index: number) => ({
          id: item?.id || index + 1,
          batchNo: item?.batch_no || item?.batchNo || "-",
          qty: toNumber(item?.qty),
          value: toNumber(item?.value),
        }))
      : [];
  }, [data]);

  if (loading || authLoading) {
    return <InventoryItemPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="rounded-[24px] border border-red-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[20px] font-semibold text-[#111827]">
                  Unable to load item details
                </h2>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    routeBranchId
                      ? `/inventory-manager/Branches/${routeBranchId}`
                      : "/inventory-manager/Branches"
                  )
                }
                className="inline-flex h-[44px] items-center justify-center rounded-[14px] border border-[#D0D5DD] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F8FAFC]"
              >
                Back to Branch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-[24px] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[30px]">
                {data?.item || itemName}
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#6B7280] sm:text-[14px]">
                Item wise inventory analytics
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-[12px] font-semibold text-[#344054]">
                  Branch ID: {branchId}
                </span>
                <span className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-[12px] font-semibold text-[#344054]">
                  Item: {data?.item || itemName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  routeBranchId
                    ? `/inventory-manager/Branches/${routeBranchId}`
                    : "/inventory-manager/Branches"
                )
              }
              className="inline-flex h-[44px] items-center justify-center rounded-[14px] border border-[#D0D5DD] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F8FAFC]"
            >
              Back
            </button>
          </div>
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
              render: (row: any) => row?.batchNo || "-",
            },
            {
              key: "qty",
              title: "Qty",
              render: (row: any) => formatNumber(toNumber(row?.qty)),
            },
            {
              key: "value",
              title: "Value",
              render: (row: any) => formatCurrency(toNumber(row?.value)),
            },
          ]}
        />
      </div>
    </div>
  );
}