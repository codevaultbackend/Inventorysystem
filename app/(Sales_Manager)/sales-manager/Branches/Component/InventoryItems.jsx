"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const INITIAL_ROWS = 5;
const LOAD_MORE_ROWS = 5;

export default function InventoryItems() {
  /* ================= PARAMS ================= */
  const params = useParams();

  // depends on your folder names
  const stateId = params?.stateId || params?.id;
  const branchId = params?.branchId;

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS);
  const loadMoreRef = useRef(null);

  /* ================= DATA ================= */
  const inventorySystem = [
    {
      itemName: "Laptop Dell XPS 15",
      category: "Electronics",
      quantity: "500",
      hsn: "GRN-2026-0145",
      grn: "GRN-2026-0145",
      batchNo: "GRN-2026-0145",
      aging: "1",
      status: "Good",
    },
    {
      itemName: "Office Chair Ergonomic",
      category: "Furniture",
      quantity: "550",
      hsn: "GRN-2026-0145",
      grn: "GRN-2026-0145",
      batchNo: "GRN-2026-0145",
      aging: "5",
      status: "Damaged",
    },
    {
      itemName: "Monitor 27inch 4K",
      category: "Electronics",
      quantity: "600",
      hsn: "GRN-2026-0145",
      grn: "GRN-2026-0145",
      batchNo: "GRN-2026-0145",
      aging: "8",
      status: "Good",
    },
    {
      itemName: "Steel Rods 10mm",
      category: "Raw Materials",
      quantity: "500",
      hsn: "GRN-2026-0145",
      grn: "GRN-2026-0145",
      batchNo: "GRN-2026-0145",
      aging: "2",
      status: "Good",
    },
    {
      itemName: "100mm Copper Wire",
      category: "Electrical",
      quantity: "1K",
      hsn: "GRN-2026-0145",
      grn: "GRN-2026-0145",
      batchNo: "GRN-2026-0145",
      aging: "0.2",
      status: "Damaged",
    },
    {
      itemName: "White Board",
      category: "Furniture",
      quantity: "300",
      hsn: "GRN-2026-0145",
      grn: "GRN-2026-0145",
      batchNo: "GRN-2026-0145",
      aging: "3",
      status: "Repairable",
    },
  ];

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return inventorySystem;

    return inventorySystem.filter((item) =>
      `${item.itemName} ${item.category} ${item.quantity} ${item.hsn} ${item.grn} ${item.batchNo} ${item.aging} ${item.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  useEffect(() => {
    setVisibleCount(INITIAL_ROWS);
  }, [search]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_ROWS, filteredData.length)
          );
        }
      },
      {
        root: null,
        rootMargin: "120px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [filteredData.length]);

  const visibleData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  const hasMoreRows = visibleCount < filteredData.length;

  /* ================= STATUS STYLE ================= */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Good":
        return "bg-green-100 text-green-600";
      case "Damaged":
        return "bg-red-100 text-red-500";
      case "Repairable":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* ================= SLUG GENERATOR ================= */
  const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  /* ================= UI ================= */
  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900">
            Inventory Items
          </h3>
          <p className="mt-1 text-sm text-gray-500">Item wise stock details</p>
        </div>

        <div className="relative w-full sm:w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search here..."
            className="h-[40px] w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-3 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0D63C8]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          {/* HEADER */}
          <thead className="bg-[#F9FAFB] font-medium text-[#6B7280]">
            <tr>
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">HSN</th>
              <th className="px-6 py-4">GRN</th>
              <th className="px-6 py-4">Batch No.</th>
              <th className="px-6 py-4">Aging</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="text-gray-800">
            {visibleData.length > 0 ? (
              visibleData.map((item, index) => (
                <tr key={index} className="border-t transition hover:bg-gray-50">
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4 font-medium text-gray-900">
                    {item.itemName}
                  </td>
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    {item.category}
                  </td>
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    {item.quantity}
                  </td>
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    {item.hsn}
                  </td>
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    {item.grn}
                  </td>
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    {item.batchNo}
                  </td>
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    {item.aging}
                  </td>

                  {/* STATUS */}
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* ANALYZE BUTTON FIXED */}
                  <td className="border border-[1px] border-[#E2E2E2] px-6 py-4">
                    <Link
                      href={`/super-admin/Branches/${stateId}/${branchId}/${generateSlug(
                        item.itemName
                      )}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Analyze
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-10 text-center text-sm text-[#64748B]"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="px-6 pb-5 pt-3">
          <div className="flex items-center justify-between gap-3 text-[12px] text-[#64748B]">
            <span>
              Showing {Math.min(visibleCount, filteredData.length)} of{" "}
              {filteredData.length}
            </span>

            {hasMoreRows && (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + LOAD_MORE_ROWS, filteredData.length)
                  )
                }
                className="rounded-lg border border-[#D0D5DD] px-3 py-1.5 font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
              >
                Load more
              </button>
            )}
          </div>

          {hasMoreRows && <div ref={loadMoreRef} className="h-2 w-full" />}
        </div>
      )}
    </div>
  );
}