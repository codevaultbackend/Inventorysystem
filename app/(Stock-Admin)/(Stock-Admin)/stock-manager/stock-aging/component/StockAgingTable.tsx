"use client";

import { Search } from "lucide-react";
import { useState, useMemo } from "react";

interface Props {
  data: any[];
}

export default function StockAgingTable({ data }: Props) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      row.item.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  return (
    <div className="bg-white rounded-[18px] border border-[#EEF2F6] shadow-[0px_6px_20px_rgba(17,24,39,0.04)] p-6 w-full">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h3 className="text-[16px] font-[600] text-[#111827]">
          Complete Stock Inventory
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-[300px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#EEF2F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filters UI (Design Only) */}
          <select className="px-3 py-2 text-[13px] border border-[#EEF2F6] rounded-lg bg-white">
            <option>All Categories</option>
          </select>

          <select className="px-3 py-2 text-[13px] border border-[#EEF2F6] rounded-lg bg-white">
            <option>All Status</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[13px] text-[#6B7280] border-b border-[#EEF2F6]">
              <th className="py-3 font-[500]">Product Name</th>
              <th className="py-3 font-[500]">Batch Number</th>
              <th className="py-3 font-[500]">Category</th>
              <th className="py-3 font-[500]">Quantity</th>
              <th className="py-3 font-[500]">GRN</th>
              <th className="py-3 font-[500]">HSN</th>
              <th className="py-3 font-[500]">Value</th>
              <th className="py-3 font-[500]">Condition</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, index) => (
              <tr
                key={index}
                className="text-[13px] text-[#111827] border-b border-[#F3F4F6] hover:bg-[#F9FAFB]"
              >
                <td className="py-3">{row.item}</td>
                <td className="py-3">{row.batch_no}</td>
                <td className="py-3">{row.category}</td>
                <td className="py-3">{row.quantity}</td>
                <td className="py-3">{row.grn}</td>
                <td className="py-3">{row.hsn}</td>
                <td className="py-3 font-[500]">
                  ₹{Number(row.value).toLocaleString()}
                </td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded-md text-[12px] font-[500] ${
                      row.status === "GOOD"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-6 text-gray-400 text-[13px]"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}