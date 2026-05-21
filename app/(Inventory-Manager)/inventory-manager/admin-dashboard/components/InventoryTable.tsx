// ================================
// InventoryTable.tsx
// ================================

"use client";

import { Search } from "lucide-react";
import {
  formatNumber,
  statusClass,
} from "@/app/utils/inventoryUtils";

type TableRow = {
  itemName: string;
  categories: string;
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
    <div className="overflow-hidden rounded-[28px] border border-[#ECECEC] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)]">

      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-[#F1F1F1] p-5 md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-[320px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by item..."
            className="h-[46px] w-full rounded-[14px] border border-[#ECECEC] bg-[#FAFAFA] pl-11 pr-4 text-[14px] outline-none focus:border-[#2563EB]"
          />
        </div>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="h-[46px] rounded-[14px] border border-[#ECECEC] bg-[#FAFAFA] px-4 text-[14px] outline-none"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* MOBILE CARDS */}
      <div className="block md:hidden">
        <div className="space-y-4 p-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-[18px] border border-[#EEF2F6] p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#111827]">
                    {row.itemName}
                  </h3>

                  <p className="mt-1 text-[13px] text-[#667085]">
                    {row.categories}
                  </p>
                </div>

                <span
                  className={`${statusClass(
                    row.status
                  )} rounded-full px-3 py-1 text-[11px]`}
                >
                  {row.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] text-[#98A2B3]">
                  Current Stock
                </span>

                <span className="font-semibold text-[#111827]">
                  {formatNumber(
                    row.currentStock
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {[
                "Item",
                "Category",
                "Current Stock",
                "Status",
              ].map((head) => (
                <th
                  key={head}
                  className="border-b border-[#ECECEC] px-7 py-4 text-left text-[13px] font-semibold text-[#667085]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-[#F8FBFF]"
              >
                <td className="border-b border-[#F1F3F5] px-7 py-5 font-semibold text-[#111827]">
                  {row.itemName}
                </td>

                <td className="border-b border-[#F1F3F5] px-7 py-5 text-[#667085]">
                  {row.categories}
                </td>

                <td className="border-b border-[#F1F3F5] px-7 py-5 font-semibold text-[#111827]">
                  {formatNumber(
                    row.currentStock
                  )}
                </td>

                <td className="border-b border-[#F1F3F5] px-7 py-5">
                  <span
                    className={`${statusClass(
                      row.status
                    )} rounded-full px-3 py-1 text-[12px]`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}