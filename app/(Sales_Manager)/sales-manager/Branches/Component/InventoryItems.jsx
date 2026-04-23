"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const LOAD_MORE_ROWS = 5;

export default function InventoryItems({ data = [], branchId, state }) {
  const [visibleRows, setVisibleRows] = useState(LOAD_MORE_ROWS);

  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data;
  }, [data]);

  const displayedRows = safeData.slice(0, visibleRows);
  const hasMore = visibleRows < safeData.length;

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto rounded-2xl border border-[#EEF2F6] bg-white shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="border-b border-[#EEF2F6]">
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#475467]">
                Item Name
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#475467]">
                Category
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#475467]">
                Quantity
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#475467]">
                Stock In
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#475467]">
                Stock Out
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#475467]">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {displayedRows.length > 0 ? (
              displayedRows.map((item, index) => (
                <tr
                  key={item?.id || `${item?.itemName || "item"}-${index}`}
                  className="border-b border-[#EEF2F6] last:border-b-0"
                >
                  <td className="px-4 py-4 text-[14px] font-medium text-[#101828]">
                    {item?.itemName || item?.name || "-"}
                  </td>

                  <td className="px-4 py-4 text-[14px] text-[#475467]">
                    {item?.category || "-"}
                  </td>

                  <td className="px-4 py-4 text-[14px] text-[#475467]">
                    {item?.quantity ?? item?.stock ?? 0}
                  </td>

                  <td className="px-4 py-4 text-[14px] text-[#475467]">
                    {item?.stockIn ?? 0}
                  </td>

                  <td className="px-4 py-4 text-[14px] text-[#475467]">
                    {item?.stockOut ?? 0}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#ECFDF3] px-3 py-1 text-[12px] font-medium text-[#027A48]">
                      {item?.status || "GOOD"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[14px] text-[#667085]"
                >
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleRows((prev) => prev + LOAD_MORE_ROWS)}
            className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-[14px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
          >
            Load More
          </button>
        </div>
      ) : null}
    </div>
  );
}