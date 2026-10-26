"use client";

import Link from "next/link";
import type { BranchItemRow } from "../../../../types/branchHierarchy";

type Props = {
  state: string;
  city: string;
  branchId: string;
  items: BranchItemRow[];
};

export default function BranchItemsTable({
  state,
  city,
  branchId,
  items,
}: Props) {
  return (
    <div className="bg-white border border-[#EEF2F6] rounded-2xl shadow-sm p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">
        Inventory Items
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#EEF2F6]">
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">Item</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">SKU</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">Category</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">Qty</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">Stock In</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">Stock Out</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">Sales</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[#F8FAFC]">
                  <td className="py-3 px-3 text-sm">{item.itemName}</td>
                  <td className="py-3 px-3 text-sm">{item.sku || "-"}</td>
                  <td className="py-3 px-3 text-sm">{item.category || "-"}</td>
                  <td className="py-3 px-3 text-sm">{item.quantity}</td>
                  <td className="py-3 px-3 text-sm">{item.stockIn}</td>
                  <td className="py-3 px-3 text-sm">{item.stockOut}</td>
                  <td className="py-3 px-3 text-sm">{item.sales}</td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/stock-manager/Branches/${encodeURIComponent(state)}/${encodeURIComponent(city)}/${encodeURIComponent(branchId)}/${encodeURIComponent(item.id)}`}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-[#64748B]">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}