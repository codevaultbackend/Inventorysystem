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
  onAdd?: () => void;
  onExport?: () => void;
}

const statusColors: Record<string, string> = {
  Good: "bg-green-100 text-green-600",
  Damaged: "bg-red-100 text-red-600",
  Repairable: "bg-yellow-100 text-yellow-600",
};

export default function StockInventoryTable({
  title = "Complete Stock Inventory",
  columns = [],
  data = [],
  onAdd,
  onExport,
}: StockInventoryTableProps) {

  /* ===== SAFE ===== */

  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  const [search, setSearch] = useState("");

  /* ===== FILTER ===== */

  const filteredData = useMemo(() => {

    if (!safeData.length) return [];

    if (!search) return safeData;

    return safeData.filter((row) =>
      Object.values(row || {})
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [safeData, search]);



  /* ===== VALUE FORMAT ===== */

  const formatValue = (value: any) => {

    if (value === null || value === undefined || value === "")
      return "NA";

    if (typeof value === "number")
      return value.toLocaleString();

    return value;
  };



  return (

    <div className="bg-white rounded-[18px] border border-[#EEF2F6] shadow-[0_6px_20px_rgba(17,24,39,0.04)] p-6 w-full">


      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4">

        <div className="flex justify-between items-center flex-wrap gap-3">

          <h3 className="text-[16px] font-[600] text-[#111827]">
            {title}
          </h3>

          <div className="flex gap-3">

            {onAdd && (
              <button
                onClick={onAdd}
                className="bg-[#2563EB] text-white text-[14px] px-4 py-2 rounded-[10px] font-[500] hover:bg-[#1D4ED8]"
              >
                Add Branch
              </button>
            )}

            {onExport && (
              <button
                onClick={onExport}
                className="border border-[#E5E7EB] text-[14px] px-4 py-2 rounded-[10px] font-[500] text-[#374151] hover:bg-[#F9FAFB]"
              >
                Export CSV
              </button>
            )}

          </div>

        </div>


        {/* SEARCH */}

        <div className="relative w-[320px]">

          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />

        </div>

      </div>



      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto mt-6">

        <table className="w-full text-left text-[14px]">

          {/* HEAD */}

          <thead>

            <tr className="bg-[#F9FAFB] border-b border-[#EEF2F6] text-[#6B7280]">

              {safeColumns.map((col) => (

                <th
                  key={col.key}
                  className="py-3 px-3 font-[500] whitespace-nowrap"
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
                  colSpan={safeColumns.length || 1}
                  className="text-center py-6 text-gray-400"
                >
                  No Data Found
                </td>
              </tr>

            )}


            {filteredData.map((row, index) => (

              <tr
                key={index}
                className="border-b border-[#F1F5F9] hover:bg-[#F9FAFB]"
              >

                {safeColumns.map((col) => {

                  const value = row?.[col.key];

                  /* STATUS */

                  if (col.key === "condition") {

                    return (
                      <td key={col.key} className="py-3 px-3">

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-[500] ${
                            statusColors[value] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {formatValue(value)}
                        </span>

                      </td>
                    );

                  }


                  /* ACTION */

                  if (col.key === "action") {

                    return (
                      <td key={col.key} className="py-3 px-3">

                        <button className="text-[#2563EB] font-[500] hover:underline">
                          View
                        </button>

                      </td>
                    );

                  }


                  /* NORMAL */

                  return (

                    <td
                      key={col.key}
                      className="py-3 px-3 whitespace-nowrap"
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