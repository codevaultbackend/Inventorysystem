// ================================
// InventoryTable.tsx
// ================================

"use client";

import {
  Download,
  Filter,
  Search,
} from "lucide-react";

import {
  formatNumber,
  statusClass,
} from "@/app/utils/inventoryUtils";

type TableRow = {
  stockId?: number;

  itemName?: string;

  itemDescription?: string;

  category?: string;

  subCategory?: string;

  currentStock: number;

  status: string;
};

type Props = {
  search: string;

  setSearch: (v: string) => void;

  category: string;

  setCategory: (v: string) => void;

  categories: string[];

  rows: TableRow[];
};

export default function InventoryTable({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  rows,
}: Props) {
  return (
    <div
      className="
        overflow-hidden
        rounded-[22px]
        border
        border-[#EAECF0]
        bg-white
        shadow-[1px_1px_4px_0px_#0000001A]
      "
    >
      {/* TOP SECTION */}
      <div
        className="
          border-b
          border-[#F2F4F7]
          px-4
          py-4
          sm:px-5
          xl:px-6
        "
      >
        {/* TITLE */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2
              className="
                text-[18px]
                sm:text-[20px]
                font-semibold
                tracking-[-0.4px]
                text-[#111827]
              "
            >
              Branch Overview
            </h2>
          </div>

          {/* ACTIONS DESKTOP */}
          <div className="hidden items-center gap-3 lg:flex">
          
            <button
              className="
                flex
                h-[42px]
                items-center
                gap-2
                rounded-[12px]
                border
                border-[#EAECF0]
                bg-white
                px-4
                text-[13px]
                font-medium
                text-[#344054]
                shadow-[1px_1px_4px_0px_#0000001A]
                transition-all
                duration-200
                hover:bg-[#F9FAFB]
              "
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {/* FILTER ROW */}
        <div
          className="
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* SEARCH */}
          <div className="relative w-full lg:max-w-[420px]">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#98A2B3]
              "
            />

            <input
              aria-label="Search inventory"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by item..."
              className="
                h-[48px]
                w-full
                rounded-[14px]
                border
                border-[#EAECF0]
                bg-[#FCFCFD]
                pl-11
                pr-4
                text-[14px]
                font-medium
                text-[#111827]
                outline-none
                transition-all
                duration-200
                placeholder:text-[#98A2B3]
                focus:border-[#3B82F6]
                focus:bg-white
                focus:ring-4
                focus:ring-[#DCEBFF]
              "
            />
          </div>

          {/* RIGHT CONTROLS */}
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
            "
          >
            {/* FILTER MOBILE/TABLET */}
            <button
              className="
                flex
                h-[48px]
                items-center
                justify-center
                gap-2
                rounded-[14px]
                border
                border-[#EAECF0]
                bg-white
                px-4
                text-[14px]
                font-medium
                text-[#344054]
                shadow-[1px_1px_4px_0px_#0000001A]
                transition-all
                duration-200
                hover:bg-[#F9FAFB]
                lg:hidden
              "
            >
              <Filter size={16} />
              Filter
            </button>

            {/* CATEGORY */}
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="
                h-[48px]
                w-full
                rounded-[14px]
                border
                border-[#EAECF0]
                bg-[#FCFCFD]
                px-4
                text-[14px]
                font-medium
                text-[#344054]
                outline-none
                transition-all
                duration-200
                focus:border-[#3B82F6]
                focus:bg-white
                focus:ring-4
                focus:ring-[#DCEBFF]
                sm:min-w-[220px]
              "
            >
              {categories.map((c) => (
                <option key={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="block lg:hidden">
        <div className="space-y-4 p-4">
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <div
                key={row.stockId || index}
                className="
                  rounded-[18px]
                  border
                  border-[#EEF2F6]
                  bg-white
                  p-4
                  shadow-[1px_1px_4px_0px_#0000001A]
                "
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* ITEM */}
                    <h3
                      className="
                        break-words
                        text-[15px]
                        font-medium
                        leading-[24px]
                        text-[#111827]
                      "
                    >
                      {row.itemDescription ||
                        row.itemName ||
                        "-"}
                    </h3>

                    {/* TAGS */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className="
                          inline-flex
                          h-[28px]
                          items-center
                          rounded-full
                          bg-[#F4F6F8]
                          px-3
                          text-[11px]
                          font-medium
                          text-[#475467]
                        "
                      >
                        {row.category || "-"}
                      </span>

                      <span
                        className="
                          inline-flex
                          h-[28px]
                          items-center
                          rounded-full
                          bg-[#EEF4FF]
                          px-3
                          text-[11px]
                          font-medium
                          text-[#1D4ED8]
                        "
                      >
                        {row.subCategory || "-"}
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`${statusClass(
                      row.status
                    )} inline-flex h-[28px] shrink-0 items-center rounded-full px-3 text-[11px] font-semibold`}
                  >
                    {row.status}
                  </span>
                </div>

                {/* FOOTER */}
                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-between
                    border-t
                    border-[#F2F4F7]
                    pt-4
                  "
                >
                  <span className="text-[13px] font-medium text-[#98A2B3]">
                    Current Stock
                  </span>

                  <span
                    className="
                      text-[16px]
                      font-semibold
                      tracking-[-0.3px]
                      text-[#111827]
                    "
                  >
                    {formatNumber(
                      row.currentStock
                    )}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div
              className="
                py-14
                text-center
                text-[14px]
                font-medium
                text-[#98A2B3]
              "
            >
              No inventory found
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px]">
          {/* HEADER */}
          <thead>
            <tr className="bg-[#F9FAFB]">
              {[
                "Item Description",
                "Category",
                "Sub Category",
                "Current Stock",
                "Status",
              ].map((head) => (
                <th
                  key={head}
                  className="
                    border-b
                    border-[#EAECF0]
                    px-6
                    py-5
                    text-left
                    text-[13px]
                    font-semibold
                    tracking-[0.01em]
                    text-[#667085]
                  "
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={row.stockId || index}
                  className="
                    transition-all
                    duration-200
                    hover:bg-[#FAFCFF]
                  "
                >
                  {/* ITEM */}
                  <td
                    className="
                      min-w-[320px]
                      border-b
                      border-[#F2F4F7]
                      px-6
                      py-5
                    "
                  >
                    <div
                      className="
                        text-[14px]
                        font-medium
                        leading-[22px]
                        text-[#111827]
                      "
                    >
                      {row.itemDescription ||
                        row.itemName ||
                        "-"}
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td
                    className="
                      whitespace-nowrap
                      border-b
                      border-[#F2F4F7]
                      px-6
                      py-5
                    "
                  >
                    <span
                      className="
                        text-[14px]
                        font-medium
                        text-[#667085]
                      "
                    >
                      {row.category || "-"}
                    </span>
                  </td>

                  {/* SUB CATEGORY */}
                  <td
                    className="
                      whitespace-nowrap
                      border-b
                      border-[#F2F4F7]
                      px-6
                      py-5
                    "
                  >
                    <span
                      className="
                        text-[14px]
                        font-medium
                        text-[#667085]
                      "
                    >
                      {row.subCategory || "-"}
                    </span>
                  </td>

                  {/* STOCK */}
                  <td
                    className="
                      whitespace-nowrap
                      border-b
                      border-[#F2F4F7]
                      px-6
                      py-5
                    "
                  >
                    <span
                      className="
                        text-[14px]
                        font-semibold
                        tracking-[-0.2px]
                        text-[#111827]
                      "
                    >
                      {formatNumber(
                        row.currentStock
                      )}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td
                    className="
                      whitespace-nowrap
                      border-b
                      border-[#F2F4F7]
                      px-6
                      py-5
                    "
                  >
                    <span
                      className={`${statusClass(
                        row.status
                      )} inline-flex h-[28px] items-center rounded-full px-3 text-[12px] font-semibold`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="
                    py-16
                    text-center
                    text-[14px]
                    font-medium
                    text-[#98A2B3]
                  "
                >
                  No inventory found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}