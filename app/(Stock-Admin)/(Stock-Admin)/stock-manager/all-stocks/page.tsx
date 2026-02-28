"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useLocations } from "@/app/context/LocationsContext";
import { useMemo, useState } from "react";

export default function AllStocksPage() {
  const { locations, loading, error } = useLocations();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  /* ================= SAFE MAP ================= */

  const stocks = Array.isArray(locations)
    ? locations.map((l: any, i: number) => ({
        id: l?.location?.toLowerCase() || i,
        branch: l?.location ?? "NA",
        category: l?.category ?? "Warehouse",
        current: l?.totalStock ?? "NA",
        stockIn: l?.totalStock ?? "NA",
        stockOut: l?.totalStock ?? "NA",
      }))
    : [];

  /* ================= BRANCH LIST ================= */

  const branchList = useMemo(() => {
    const list = stocks.map((s) => s.branch);
    return ["All", ...list];
  }, [stocks]);

  /* ================= FILTER ================= */

  const filteredStocks = useMemo(() => {
    let data = stocks;

    if (branchFilter !== "All") {
      data = data.filter(
        (s) => s.branch === branchFilter
      );
    }

    if (search) {
      data = data.filter((s) =>
        Object.values(s)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    return data;
  }, [stocks, search, branchFilter]);

  return (
    <div className="w-full bg-[#F4F6F9] min-h-screen p-6">

      <div className="bg-white rounded-[18px] shadow overflow-hidden">

        {/* ================= TOP BAR ================= */}

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between p-6 border-b bg-[#FAFAFA]">

          {/* SEARCH */}

          <div className="relative w-full md:w-[300px]">

            <Search
              size={16}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* FILTER */}

          <select
            value={branchFilter}
            onChange={(e) =>
              setBranchFilter(e.target.value)
            }
            className="px-4 py-2.5 border rounded-xl bg-white text-sm"
          >
            {branchList.map((b) => (
              <option key={b}>
                {b}
              </option>
            ))}
          </select>

        </div>

        {/* ================= TABLE ================= */}

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-[#F1F3F6] text-gray-700 text-sm">

              <tr>

                <th className="px-6 py-4">
                  Branch Name
                </th>

                <th className="px-6 py-4">
                  Category
                </th>

                <th className="px-6 py-4">
                  Current Stock
                </th>

                <th className="px-6 py-4">
                  Stock IN
                </th>

                <th className="px-6 py-4">
                  Stock OUT
                </th>

                <th className="px-6 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredStocks.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-400"
                  >
                    No Data Found
                  </td>
                </tr>
              )}

              {filteredStocks.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="px-6 py-4">
                    {item.branch ?? "NA"}
                  </td>

                  <td className="px-6 py-4">
                    {item.category ?? "NA"}
                  </td>

                  <td className="px-6 py-4">
                    {item.current ?? "NA"}
                  </td>

                  <td className="px-6 py-4">
                    {item.stockIn ?? "NA"}
                  </td>

                  <td className="px-6 py-4">
                    {item.stockOut ?? "NA"}
                  </td>

                  <td className="px-6 py-4 text-center">

                    <Link
                      href={`/stock-manager/all-stocks/${item.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}