"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function InventoryItems() {
  /* ================= PARAMS ================= */
  const params = useParams();

  // depends on your folder names
  const stateId = params?.stateId || params?.id;
  const branchId = params?.branchId;

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
  const generateSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, "-");

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">

          {/* HEADER */}
          <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium">
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
            {inventorySystem.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900 border border-[1px]  border-[#E2E2E2]">
                  {item.itemName}
                </td>
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.category}</td>
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.quantity}</td>
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.hsn}</td>
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.grn}</td>
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.batchNo}</td>
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.aging}</td>

                {/* STATUS */}
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* ANALYZE BUTTON FIXED */}
                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">
                  <Link
                    href={`/super-admin/Branches/${stateId}/${branchId}/${generateSlug(
                      item.itemName
                    )}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Analyze
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
