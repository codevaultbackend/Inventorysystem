"use client";

import { useState } from "react";
import { Search, Upload, Download } from "lucide-react";

type Column = {
  key: string;
  label: string;
};

type Props = {
  columns: Column[];
  data: any[];
  onView?: (row: any) => void;
};

export default function LedgerTable({ columns, data, onView }: Props) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="w-full">

      {/* TOP BAR */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        {/* SEARCH */}

        <div className="relative w-full max-w-[420px]">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F5F6F8] text-sm outline-none"
          />

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex items-center gap-3">

          <button className="flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] text-white text-sm rounded-lg shadow-sm hover:bg-blue-700 transition">
            <Upload size={16} />
            Upload PDF
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#F5F6F8] text-sm rounded-lg hover:bg-gray-200 transition">
            <Download size={16} />
            Export CSV
          </button>

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto rounded-xl border border-gray-200">

        <table className="w-full text-sm">

          {/* HEADER */}

          <thead className="bg-[#F3F4F6] text-gray-600">

            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-6 py-3 font-semibold"
                >
                  {col.label}
                </th>
              ))}
            </tr>

          </thead>

          {/* BODY */}

          <tbody className="divide-y">

            {filtered.map((row, i) => (

              <tr key={i} className="hover:bg-gray-50 border-[#D3D3D3]">

                {columns.map((col) => {

                  if (col.key === "action") {
                    return (
                      <td key={col.key} className="px-6 py-4">
                        <button
                          onClick={() => onView?.(row)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className="px-6 py-4 text-gray-700">
                      {row[col.key]}
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