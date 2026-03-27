"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export type InventoryItemRow = {
  id: string;
  itemName: string;
  category: string;
  quantity: number | string;
  hsn?: string;
  grn?: string;
  batchNo?: string;
  aging?: number | string;
  status?: string;
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

    if (normalized === "good") {
      return "bg-green-100 text-green-600";
    }
    if (normalized === "damaged") {
      return "bg-red-100 text-red-500";
    }
    if (normalized === "repairable") {
      return "bg-yellow-100 text-yellow-600";
    }

    return "bg-gray-100 text-gray-600";
  };

  const generateSlug = (name: string) =>
    String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const getItemHref = (item: InventoryItemRow) => {
    const resolvedBranchId = String(
      branchId ??
        item.branchId ??
        (user as any)?.branchId ??
        (user as any)?.branch_id ??
        (user as any)?.branches?.[0] ??
        ""
    );

    const itemId = encodeURIComponent(String(item.id || ""));
    const itemSlug = encodeURIComponent(generateSlug(item.itemName));
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
    return data.slice(0, visibleCount);
  }, [data, visibleCount]);

  const hasMore = visibleCount < data.length;

  const loadMoreRows = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_ROWS, data.length));
  }, [data.length]);

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
        className="max-h-[560px] overflow-auto"
      >
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#F9FAFB] font-medium text-[#6B7280]">
            <tr>
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">HSN</th>
              <th className="px-6 py-4">GRN</th>
              <th className="px-6 py-4">Batch No.</th>
              <th className="px-6 py-4">Aging</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {visibleRows.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-t transition hover:bg-gray-50"
              >
                <td className="border border-[#E2E2E2] px-6 py-4 font-medium text-gray-900">
                  {item.itemName}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4">
                  {item.category || "-"}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4">
                  {item.quantity ?? "-"}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4">
                  {item.hsn || "-"}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4">
                  {item.grn || "-"}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4">
                  {item.batchNo || "-"}
                </td>
                <td className="border border-[#E2E2E2] px-6 py-4">
                  {item.aging ?? "-"}
                </td>

                <td className="border border-[#E2E2E2] px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status || "-"}
                  </span>
                </td>

                <td className="border border-[#E2E2E2] px-6 py-4">
                  <Link
                    href={getItemHref(item)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {!data.length && (
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
      <div className="max-h-[560px] overflow-auto animate-pulse">
        <table className="min-w-full text-left text-sm">
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
                <th key={head} className="px-6 py-4">
                  <div className="h-4 w-20 rounded bg-[#E5E7EB]" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="border-t">
                {Array.from({ length: 9 }).map((__, col) => (
                  <td
                    key={col}
                    className="border border-[#E2E2E2] px-6 py-4"
                  >
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