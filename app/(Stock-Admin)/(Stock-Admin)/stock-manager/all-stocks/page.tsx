"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useStateLocations } from "../../../../context/StateLocation";
import { useMemo, useState } from "react";

export default function AllStocksPage() {

  const { stateLocation, stateLoading, stateError } = useStateLocations();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  /* ================= NORMALIZE API ================= */

  const normalizedData = useMemo(() => {
    if (!stateLocation) return [];

    if (Array.isArray(stateLocation)) return stateLocation;

    if (Array.isArray((stateLocation as any).locations))
      return (stateLocation as any).locations;

    return [];
  }, [stateLocation]);

  /* ================= MAP API ================= */

  const stocks = useMemo(() => {
    return normalizedData.map((item: any, i: number) => ({
      id:
        item?.branchName?.toLowerCase()?.replace(/\s/g, "-") ||
        `row-${i}`,

      branch: item?.branchName ?? "NA",
      category: item?.category ?? "NA",
      current: item?.currentStock ?? 0,
      stockIn: item?.stockIn ?? 0,
      stockOut: item?.stockOut ?? 0,
    }));
  }, [normalizedData]);

  /* ================= BRANCH LIST ================= */

  const branchList = useMemo(() => {
    const list = stocks.map((s) => s.branch);
    return ["All", ...Array.from(new Set(list))];
  }, [stocks]);

  /* ================= FILTER ================= */

  const filteredStocks = useMemo(() => {
    let data = [...stocks];

    if (branchFilter !== "All") {
      data = data.filter((s) => s.branch === branchFilter);
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
    <div className="w-full bg-[#F4F6F9] min-h-screen  sm:px-4 md:px-6 py-4 md:py-6">

      <div className="bg-white rounded-[20px] shadow overflow-hidden">

        {/* ================= TOP BAR ================= */}

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between p-4 sm:p-5 md:p-6 border-[#D3D3D3] border-b bg-[#FAFAFA]">

          {/* SEARCH */}

          <div className="relative bg-[#F7F7F7] w-full max-w-[449px]">

            <Search
              size={16}
              className="absolute left-3 top-3 text-[#A8A8A8]"
            />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
              pl-9 pr-3
              py-2.5
              rounded-xl
              bg-[#e7e7e7]
              text-sm
              outline-none
              w-full
            "
            />

          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-3 sm:gap-4">

            {/* DOWNLOAD */}

            <button
              className="
              px-4
              py-2.5
              rounded-[8px]
              bg-white
              text-[12px]
              shadow-[1px_1px_4px_0_#0000001A]
              hover:bg-gray-50
              transition
            "
            >
              Download CSV
            </button>

            {/* BRANCH FILTER */}

            <div
              className="
              px-3
              py-2.5
              rounded-[8px]
              bg-white
              text-[12px]
              shadow-[1px_1px_4px_0_#0000001A]
            "
            >
              <select
                value={branchFilter}
                onChange={(e) =>
                  setBranchFilter(e.target.value)
                }
                className="outline-none bg-transparent"
              >
                {branchList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* ================= TABLE ================= */}

        <div className="overflow-x-auto">

          <table className="min-w-[700px] w-full text-left">

            {/* HEADER */}

            <thead className="bg-[#F1F3F6] text-[13px] sm:text-sm sticky top-0">

              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Branch Name
                </th>

                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Category
                </th>

                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Current Stock
                </th>

                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Stock IN
                </th>

                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Stock OUT
                </th>

                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold">
                  Action
                </th>
              </tr>

            </thead>

            {/* BODY */}

            <tbody className="text-[13px] sm:text-[14px]">

              {stateLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              )}

              {stateError && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-red-500">
                    {stateError}
                  </td>
                </tr>
              )}

              {!stateLoading && filteredStocks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No Data Found
                  </td>
                </tr>
              )}

              {!stateLoading &&
                filteredStocks.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {item.branch}
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {item.category}
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {item.current}
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {item.stockIn}
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {item.stockOut}
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">

                      <Link
                        href={`/stock-manager/all-stocks/${item.id}`}
                        className="text-blue-600 hover:underline"
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