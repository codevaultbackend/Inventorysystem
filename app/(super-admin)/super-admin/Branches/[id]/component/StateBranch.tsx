"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSuperDashboard } from "@/app/context/SuperDashboardContext";

export default function StateBranch() {
  const [period] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");

  const params = useParams();
  const stateId = (params?.id || params?.stateId || "") as string;

  /* ================= CONTEXT ================= */
  const { branches, setLocation, loading } = useSuperDashboard();

  /* ================= SET LOCATION FROM PARAM ================= */
  useEffect(() => {
    if (stateId) {
      setLocation(stateId);
    }
  }, [stateId, setLocation]);

  /* ================= FILTER BRANCHES ================= */
  const filteredBranches =
    branches?.filter(
      (b: any) =>
        b.state?.toLowerCase() === stateId.toLowerCase()
    ) || [];

  return (
    <div className="bg-white max-[768px]:bg-transparent max-[768px]: rounded-2xl border border-[#EEF2F6] shadow-sm w-full overflow-hidden max-[768px]:mb-[20px]">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 ">
        <div>
          <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#0F172A]">
            Branch Overview
          </h3>
          <p className="text-[12px] sm:text-[13px] text-[#64748B] mt-1">
            State: {stateId}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href={`/super-admin/Branches/${stateId}/edit`}>
            <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition">
              Edit Branch
            </button>
          </Link>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="bg-[#F8FAFC] text-left !whitespace-nowrap">
              {[
                "Branch Name",
                "Stock Items",
                "Purchase",
                "Sales",
                "Stock IN",
                "Stock OUT",
                "Action",
              ].map((head) => (
                <th
                  key={head}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-[12px] sm:text-[13px] font-medium text-[#475569] !whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                  No branches found
                </td>
              </tr>
            ) : (
              filteredBranches.map((branch: any) => {
                /* fallback because API may not have period data */
                const row = {
                  stock: branch.stock_items ?? 0,
                  purchase: branch.purchase ?? "₹0",
                  sales: branch.sales ?? "₹0",
                  in: branch.stock_in ?? 0,
                  out: branch.stock_out ?? 0,
                };

                return (
                  <tr
                    key={branch.id}
                    className="border-b hover:bg-[#F8FAFC] transition"
                  >
                    <td className="px-4 sm:px-6 py-4 font-medium border border-[1px] border-[#E2E2E2] text-[#0F172A] whitespace-nowrap">
                      {branch.name}
                    </td>

                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap border border-[1px] border-[#E2E2E2]">
                      {row.stock}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap border border-[1px] border-[#E2E2E2]">
                      {row.purchase}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap border border-[1px] border-[#E2E2E2]">
                      {row.sales}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap border border-[1px] border-[#E2E2E2]">
                      {row.in}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap border border-[1px] border-[#E2E2E2]">
                      {row.out}
                    </td>

                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap border border-[1px] border-[#E2E2E2]">
                      <Link
                        href={`/super-admin/Branches/${stateId}/${branch.id}`}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
