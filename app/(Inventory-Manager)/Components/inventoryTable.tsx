"use client";

import { useStateLocations } from "../../context/StateLocation";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

interface Column {
  key: string;
  label: string;
}

interface StockInventoryTableProps {
  title?: string;
  columns?: Column[];
  onAdd?: () => void;
  onExport?: () => void;
  onView?: (row: any) => void;
}

const statusColors: Record<string, string> = {
  Good: "bg-green-100 text-green-600",
  Damaged: "bg-red-100 text-red-600",
  Repairable: "bg-yellow-100 text-yellow-600",
  "In Transit": "bg-blue-100 text-blue-600",
};

export default function InventoryTable({
  title = "Complete Stock Inventory",
  columns = [],
  onAdd,
  onExport,
  onView,
}: StockInventoryTableProps) {

  const { stateLocation, stateLoading, stateError } = useStateLocations();

  const router = useRouter();

  const [search, setSearch] = useState("");

  const safeColumns = Array.isArray(columns) ? columns : [];

  /* ================= MAP API DATA ================= */

  const tableData = useMemo(() => {

    if (!Array.isArray(stateLocation)) return [];

    return stateLocation.map((l: any, index: number) => ({

      branch: l.branchName || "NA",

      category: l.category || "NA",

      hsn: `LOC-${index + 1}`,

      current: Number(l.currentStock || 0),

      stockIn: Number(l.stockIn || 0),

      stockOut: Number(l.stockOut || 0),

      condition: "Good",

      action: true,

      branchId:
        l.branchName
          ?.toLowerCase()
          ?.replace(/\s/g, "-") || index,

    }));

  }, [stateLocation]);

  /* ================= SEARCH ================= */

  const filteredData = useMemo(() => {

    if (!tableData.length) return [];

    if (!search) return tableData;

    return tableData.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [tableData, search]);

  const formatValue = (value: any) => {

    if (value === null || value === undefined || value === "")
      return "NA";

    if (typeof value === "number")
      return value.toLocaleString();

    return value;

  };

  /* ================= LOADING ================= */

  if (stateLoading) {
    return (
      <div className="bg-white rounded-[18px] border border-[#EEF2F6] p-6">
        Loading inventory...
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (stateError) {
    return (
      <div className="bg-white rounded-[18px] border border-[#EEF2F6] p-6 text-red-500">
        {stateError}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[18px] border border-[#EEF2F6] shadow-[1px_1px_4px_rgba(0,0,0,0.1)] p-6 w-full">

      {/* HEADER */}

      <div className="flex justify-between items-center flex-wrap gap-3 mb-4">

        <h3 className="text-[16px] font-[600] text-[#111827]">
          {title}
        </h3>

        <div className="flex gap-2">

          {onExport && (
            <button
              onClick={onExport}
              className="border border-[#E5E7EB] text-[13px] px-3 py-2 rounded-[10px] bg-white hover:bg-gray-50"
            >
              Export CSV
            </button>
          )}

        </div>

      </div>

      {/* SEARCH */}

      <div className="relative max-w-[280px] w-full mb-4">

        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />

        <input
          type="text"
          placeholder="Search by item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] text-[13px]"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full text-left text-[13px]">

          <thead>

            <tr className="bg-[#F9FAFB]  text-[#6B7280]">

              {safeColumns.map((col) => (

                <th key={col.key} className="py-3 px-3 font-[500] whitespace-nowrap">

                  {col.label}

                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {filteredData.length === 0 && (

              <tr>

                <td
                  colSpan={safeColumns.length}
                  className="text-center py-6 text-gray-400"
                >
                  No Data Found
                </td>

              </tr>

            )}

            {filteredData.map((row, index) => (

              <tr
                key={index}
                className=" hover:bg-[#FAFAFA]"
              >

                {safeColumns.map((col) => {

                  const value = row[col.key];

                  if (col.key === "condition") {

                    return (

                      <td key={col.key} className="py-3 px-3">

                        <span
                          className={`px-2 py-1 rounded-full text-[11px] font-medium ${
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

                      <td key={col.key} className="py-3 px-3">

                        <button
                          onClick={() =>
                            router.push(
                              `/stock-manager/all-stocks/${row.branchId}`
                            )
                          }
                          className="text-[#2563EB] font-medium hover:underline"
                        >

                          View

                        </button>

                      </td>

                    );

                  }

                  return (

                    <td
                      key={col.key}
                      className="py-3 px-3 text-[#111827]"
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