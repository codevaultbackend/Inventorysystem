"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export type InventoryItemRow = {
  id: string;
  itemName?: string;
  name?: string;
  item?: string;
  category?: string;
  quantity?: number | string;
  stock?: number | string;
  current_stock?: number | string;
  hsn?: string;
  grn?: string;
  batchNo?: string;
  batch_no?: string;
  aging?: number | string;
  status?: string;
  stockIn?: number | string;
  stockOut?: number | string;
  branchId?: string | number;
  branch_id?: string | number;
};

type NormalizedInventoryItemRow = {
  id: string;
  itemName: string;
  category: string;
  quantity: number | string;
  hsn: string;
  grn: string;
  batchNo: string;
  aging: number | string;
  status: string;
  stockIn?: number | string;
  stockOut?: number | string;
  branchId?: string | number;
};

type Props = {
  data: InventoryItemRow[];
  branchId?: string | number;
  state?: string;
  branchName?: string;
  loading?: boolean;
};

const INITIAL_ROWS = 20;
const LOAD_MORE_ROWS = 20;
const SCROLL_THRESHOLD = 120;

export default function InventoryItems({
  data,
  branchId,
  state,
  branchName,
  loading = false,
}: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS);

  const role = String(user?.role || "");

  const rootSegment = useMemo(() => {
    const seg = pathname?.split("/").filter(Boolean)?.[0];
    return seg || "admin";
  }, [pathname]);

  useEffect(() => {
    setVisibleCount(INITIAL_ROWS);
  }, [data]);

  const getStatusStyle = (status?: string) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "good") return "bg-green-100 text-green-600";
    if (normalized === "damaged") return "bg-red-100 text-red-500";
    if (normalized === "repairable") return "bg-yellow-100 text-yellow-600";

    return "bg-gray-100 text-gray-600";
  };

  const generateSlug = (name: string) =>
    String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const normalizedRows: NormalizedInventoryItemRow[] = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map((item, index) => {
        const resolvedName =
          item?.itemName || item?.name || item?.item || `Item ${index + 1}`;

        const resolvedQuantity =
          item?.quantity ?? item?.stock ?? item?.current_stock ?? "-";

        return {
          id: String(item?.id ?? `item-${index + 1}`),
          itemName: String(resolvedName),
          category: String(item?.category || "General"),
          quantity: resolvedQuantity,
          hsn: String(item?.hsn || "-"),
          grn: String(item?.grn || "-"),
          batchNo: String(item?.batchNo || item?.batch_no || "-"),
          aging: item?.aging ?? "-",
          status: String(item?.status || "GOOD"),
          stockIn: item?.stockIn,
          stockOut: item?.stockOut,
          branchId: item?.branchId ?? item?.branch_id,
        };
      })
      .filter((item) => item.itemName.trim() !== "");
  }, [data]);

  const getItemHref = (item: NormalizedInventoryItemRow) => {
    const resolvedBranchId = String(
      branchId ??
        item.branchId ??
        (user as any)?.branchId ??
        (user as any)?.branch_id ??
        (user as any)?.branches?.[0] ??
        ""
    );

    const itemSlug = encodeURIComponent(generateSlug(item.itemName));
    const itemId = encodeURIComponent(String(item.id || itemSlug));
    const encodedState = encodeURIComponent(String(state || ""));

    if (role === "super_admin" && resolvedBranchId && state) {
      return `/${rootSegment}/Branches/${encodedState}/${encodeURIComponent(
        resolvedBranchId
      )}/${itemSlug}`;
    }

    const params = new URLSearchParams({
      branchId: resolvedBranchId,
      state: String(state || ""),
      branchName: String(branchName || ""),
      itemName: String(item.itemName || ""),
    });

    return `/${rootSegment}/all-stocks/${itemId}?${params.toString()}`;
  };

  const visibleRows = useMemo(() => {
    return normalizedRows.slice(0, visibleCount);
  }, [normalizedRows, visibleCount]);

  const hasMore = visibleCount < normalizedRows.length;

  const loadMoreRows = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_MORE_ROWS, normalizedRows.length)
    );
  }, [normalizedRows.length]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || !hasMore) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom <= SCROLL_THRESHOLD) {
      loadMoreRows();
    }
  }, [hasMore, loadMoreRows]);

  if (loading) {
    return <InventoryItemsSkeleton />;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-[560px] overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#F9FAFB] font-medium text-[#6B7280]">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Item Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Category</th>
              <th className="px-6 py-4 whitespace-nowrap">Quantity</th>
              <th className="px-6 py-4 whitespace-nowrap">HSN</th>
              <th className="px-6 py-4 whitespace-nowrap">GRN</th>
              <th className="px-6 py-4 whitespace-nowrap">Batch No.</th>
              <th className="px-6 py-4 whitespace-nowrap">Aging</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 whitespace-nowrap">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {visibleRows.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-t transition hover:bg-gray-50"
              >
                <td className="border border-[#E2E2E2] px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.itemName}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  {item.category}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  {item.quantity ?? "-"}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  {item.hsn}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  {item.grn}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  {item.batchNo}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  {item.aging}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status || "-"}
                  </span>
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4 whitespace-nowrap">
                  <Link
                    href={getItemHref(item)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {!normalizedRows.length && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-sm text-[#667085]"
                >
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {hasMore && (
          <div className="border-t border-[#E2E8F0] bg-white px-4 py-3 text-center text-xs text-[#667085]">
            Scroll to load more items...
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryItemsSkeleton() {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="max-h-[560px] overflow-x-auto overflow-y-auto animate-pulse [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#F9FAFB] font-medium text-[#6B7280]">
            <tr>
              {[
                "Item Name",
                "Category",
                "Quantity",
                "HSN",
                "GRN",
                "Batch No.",
                "Aging",
                "Status",
                "Action",
              ].map((head) => (
                <th key={head} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-20 rounded bg-[#E5E7EB]" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="border-t">
                {Array.from({ length: 9 }).map((__, col) => (
                  <td key={col} className="border border-[#E2E2E2] px-6 py-4">
                    <div className="h-4 w-full max-w-[90px] rounded bg-[#EEF2F6]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}