"use client";

import { Search } from "lucide-react";
import { useState, useMemo } from "react";

interface Column {
  key: string;
  label: string;
}

interface StockInventoryTableProps {
  title?: string;
  columns?: Column[];
  data?: any[];
  onExport?: () => void;
}

const statusColors: Record<string, string> = {
  Reached: "bg-green-100 text-green-600",
  Missing: "bg-red-100 text-red-600",
  Damaged: "bg-red-100 text-red-600",
  Repairable: "bg-yellow-100 text-yellow-600",
  "In Transit": "bg-blue-100 text-blue-600",
};

export default function InventoryTable({
  title = "In Transit Items",
  columns = [],
  data = [],
  onExport,
}: StockInventoryTableProps) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return safeData;

    return safeData.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [safeData, search]);

  const formatValue = (value: any) => {
    if (!value) return "—";
    if (typeof value === "number") return value.toLocaleString();
    return value;
  };

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
      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">

        <h3 className="text-[15px] font-semibold text-[#111827]">
          {title}
        </h3>

        {onExport && (
          <button
            onClick={onExport}
            className="
              text-[12px]
              border border-[#E5E7EB]
              px-4 py-2
              rounded-[10px]
              bg-white
              text-[#111827]
              hover:bg-gray-50
            "
          >
            Export CSV
          </button>
        )}

      </div>

      {/* SEARCH */}

      <div className="mb-4">

        <div className="relative max-w-[340px]">

          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item..."
            className="
              w-full
              pl-9 pr-3 py-2.5
              text-[12.5px]
              rounded-[10px]
              border border-[#E5E7EB]
              bg-[#F9FAFB]
              outline-none
            "
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full text-[12.5px]">

          {/* HEADER */}

          <thead>

            <tr
              className="
                bg-[#F9FAFB]
                border-b border-[#E5EAF2]
                text-[#6B7280]
              "
            >
              {safeColumns.map((col) => (
                <th
                  key={col.key}
                  className="
                    text-left
                    font-medium
                    px-4
                    py-3.5
                    whitespace-nowrap
                  "
                >
                  {col.label}
                </th>
              ))}
            </tr>

          </thead>

          {/* BODY */}

          <tbody>

            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={safeColumns.length}
                  className="text-center py-8 text-gray-400"
                >
                  No Data Found
                </td>
              </tr>
            )}

            {filteredData.map((row, index) => (

              <tr
                key={index}
                className="
                  border-b border-[#F1F5F9]
                  hover:bg-[#FAFAFA]
                "
              >

                {safeColumns.map((col) => {

                  const value = row[col.key];

                  if (col.key === "status") {
                    return (
                      <td key={col.key} className="px-4 py-3.5">

                        <span
                          className={`
                            px-2.5 py-[4px]
                            rounded-full
                            text-[11px]
                            font-medium
                            ${
                              statusColors[value] ||
                              "bg-gray-100 text-gray-600"
                            }
                          `}
                        >
                          {value}
                        </span>

                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      className="
                        px-4
                        py-3.5
                        text-[#111827]
                        whitespace-nowrap
                      "
                    >
                      {formatValue(value)}
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