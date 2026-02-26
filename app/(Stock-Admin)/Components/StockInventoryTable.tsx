"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface Column {
  key: string;
  label: string;
}

interface StockInventoryTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onExport?: () => void;
}

const statusColors: Record<string, string> = {
  Good: "bg-green-100 text-green-600",
  Damaged: "bg-red-100 text-red-600",
  Repairable: "bg-yellow-100 text-yellow-600",
};

export default function StockInventoryTable({
  title,
  columns,
  data,
  onAdd,
  onExport,
}: StockInventoryTableProps) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      className="
        bg-white
        rounded-[18px]
        border border-[#EEF2F6]
        shadow-[0px_6px_20px_rgba(17,24,39,0.04)]
        p-6
        w-full
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-[600] text-[#111827]">
          {title}
        </h3>

        <div className="flex items-center gap-3">
          {onAdd && (
            <button
              onClick={onAdd}
              className="
                bg-[#2563EB]
                hover:bg-[#1D4ED8]
                text-white
                text-[14px]
                font-[500]
                px-4 py-2
                rounded-[10px]
                transition
              "
            >
              Add Branch
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="
                border border-[#E5E7EB]
                text-[14px]
                font-[500]
                px-4 py-2
                rounded-[10px]
                text-[#374151]
                hover:bg-[#F9FAFB]
                transition
              "
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-[320px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search by item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full
            pl-9 pr-3 py-2
            border border-[#E5E7EB]
            rounded-[12px]
            text-[14px]
            focus:outline-none
            focus:ring-2
            focus:ring-[#2563EB]
          "
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b text-[#6B7280]">
              {columns.map((col) => (
                <th key={col.key} className="py-3 font-[500]">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-[#111827]">
            {filteredData.map((row, index) => (
              <tr
                key={index}
                className="border-b last:border-none hover:bg-[#F9FAFB]"
              >
                {columns.map((col) => {
                  const value = row[col.key];

                  if (col.key === "condition") {
                    return (
                      <td key={col.key} className="py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-[500] ${
                            statusColors[value] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {value}
                        </span>
                      </td>
                    );
                  }

                  if (col.key === "action") {
                    return (
                      <td key={col.key} className="py-3">
                        <button className="text-[#2563EB] font-[500] hover:underline">
                          View
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className="py-3">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}