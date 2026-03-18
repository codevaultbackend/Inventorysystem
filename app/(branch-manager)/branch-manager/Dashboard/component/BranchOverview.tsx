"use client";

import Link from "next/link";
import { useSuperDashboard } from "@/app/context/SuperDashboardContext";

export default function BranchOverview() {

  const { data, setLocation, loading } = useSuperDashboard();

  const branches = data?.branchOverview || [];

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading branches...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm w-full overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-5">
        <div>
          <h3 className="text-[18px] font-semibold text-[#0F172A]">
            Branch Overview
          </h3>

          <p className="text-[13px] text-[#64748B] mt-1">
            Latest system activities and updates
          </p>
        </div>

        <Link href="/super-admin/Branches/EditBranch">
          <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition">
            Edit Branch
          </button>
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">

          <thead>
            <tr className="bg-[#F8FAFC] text-left">
              <th className="px-6 py-4 text-[13px] font-medium text-[#475569]">
                Branch Name
              </th>

              <th className="px-6 py-4 text-[13px] font-medium text-[#475569]">
                Stock Items
              </th>

              <th className="px-6 py-4 text-[13px] font-medium text-[#475569]">
                Stock Value
              </th>

              <th className="px-6 py-4 text-[13px] font-medium text-[#475569]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {branches.map((branch: any) => (
              <tr
                key={branch.id}
                className="hover:bg-[#F8FAFC] transition"
              >

                <td className="px-6 py-4 font-medium text-[#0F172A] border border-[#E2E2E2]">
                  {branch.name}
                </td>

                <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                  {branch.stock_items || 0}
                </td>

                <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                  ₹{branch.stock_value || 0}
                </td>

                <td className="px-6 py-4 border border-[#E2E2E2]">
                  <Link
                    onClick={() => setLocation(branch.name)}
                    href={`/super-admin/Branches/${branch.id}`}
                    className="text-blue-600 text-sm font-medium hover:underline"
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
  );
}