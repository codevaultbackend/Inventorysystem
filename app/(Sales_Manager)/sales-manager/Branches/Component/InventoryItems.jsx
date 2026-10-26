"use client";

import { useMemo, useState } from "react";

const LOAD_MORE_ROWS = 7;

function toDisplayNumber(value) {
  if (value === null || value === undefined || value === "") return "0";

  const num =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/,/g, "").trim());

  if (Number.isNaN(num)) return String(value);

  return new Intl.NumberFormat("en-IN").format(num);
}

function getStatusStyles(status) {
  const normalized = String(status || "").toLowerCase().trim();

  if (normalized === "damaged") {
    return {
      label: "Damaged",
      className: "bg-[#FEE4E2] text-[#F04438] border border-[#FECDCA]",
    };
  }

  if (normalized === "repairable") {
    return {
      label: "Repairable",
      className: "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
    };
  }

  if (normalized === "pending") {
    return {
      label: "Pending",
      className: "bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]",
    };
  }

  if (normalized === "low") {
    return {
      label: "Low",
      className: "bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]",
    };
  }

  return {
    label: "Good",
    className: "bg-[#ECFDF3] text-[#16A34A] border border-[#ABEFC6]",
  };
}

export default function InventoryItems({ data = [] }) {
  const [visibleRows, setVisibleRows] = useState(LOAD_MORE_ROWS);

  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data;
  }, [data]);

  const displayedRows = safeData.slice(0, visibleRows);
  const hasMore = visibleRows < safeData.length;

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-[18px] border border-[#D9DEE7] bg-white shadow-[0px_2px_10px_rgba(16,24,40,0.06)]">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1060px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#F5F7FA]">
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  Item Name
                </th>
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  Category
                </th>
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  Quantity
                </th>
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  HSN
                </th>
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  GRN
                </th>
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  Batch No.
                </th>
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  Aging
                </th>
                <th className="whitespace-nowrap border-b border-[#E5E7EB] px-6 py-4 text-left text-[15px] font-semibold text-[#111827]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {displayedRows.length > 0 ? (
                displayedRows.map((item, index) => {
                  const statusObj = getStatusStyles(item?.status);

                  const itemName = item?.itemName || item?.name || "-";
                  const category = item?.category || "-";
                  const quantity = item?.quantity ?? item?.stock ?? 0;

                  const hsn =
                    item?.hsn ||
                    item?.HSN ||
                    `HSN-${String(index + 1).padStart(4, "0")}`;

                  const grn =
                    item?.grn ||
                    item?.GRN ||
                    `GRN-2026-${String(index + 145).padStart(4, "0")}`;

                  const batchNo =
                    item?.batchNo ||
                    item?.batch_no ||
                    item?.batch ||
                    `BAT-${String(index + 145).padStart(4, "0")}`;

                  const aging =
                    item?.aging ??
                    item?.agingDays ??
                    item?.age ??
                    Math.max(1, index + 1);

                  return (
                    <tr
                      key={item?.id || `${itemName}-${index}`}
                      className="transition-colors hover:bg-[#FAFBFC]"
                    >
                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5 text-[16px] font-medium text-[#111827]">
                        {itemName}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5 text-[15px] font-normal text-[#374151]">
                        {category}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5 text-[15px] font-normal text-[#374151]">
                        {toDisplayNumber(quantity)}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5 text-[15px] font-normal text-[#374151]">
                        {hsn}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5 text-[15px] font-normal text-[#374151]">
                        {grn}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5 text-[15px] font-normal text-[#374151]">
                        {batchNo}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5 text-[15px] font-normal text-[#374151]">
                        {aging}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#ECEFF3] px-6 py-5">
                        <span
                          className={`inline-flex h-[24px] items-center rounded-full px-3 text-[12px] font-medium leading-none ${statusObj.className}`}
                        >
                          {statusObj.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-[15px] text-[#6B7280]"
                  >
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleRows((prev) => prev + LOAD_MORE_ROWS)}
            className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-5 text-[14px] font-medium text-[#344054] shadow-sm transition hover:bg-[#F9FAFB]"
          >
            Load More
          </button>
        </div>
      ) : null}
    </div>
  );
}