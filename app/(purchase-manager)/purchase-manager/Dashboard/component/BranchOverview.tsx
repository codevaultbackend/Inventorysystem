"use client";

import { useState } from "react";
import Link from "next/link";
import { useSuperDashboard } from "@/app/context/SuperDashboardContext";

export default function BranchOverview() {
  /* ================= FILTER STATE ================= */
  const [period] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");

  const { setLocation } = useSuperDashboard();

  /* ================= DATA ================= */
  const branches = [
    {
      name: "Karnataka",
      id: "Karnataka",
      data: {
        Daily: { stock: 120, purchase: "₹1 Lakh", sales: "₹80K", in: 120, out: 110 },
        Weekly: { stock: 500, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 500, out: 500 },
        Monthly: { stock: 2200, purchase: "₹20 Lakhs", sales: "₹18 Lakhs", in: 2100, out: 2000 },
      },
    },
    {
      name: "Maharashtra",
      id: "Maharashtra",
      data: {
        Daily: { stock: 150, purchase: "₹90K", sales: "₹70K", in: 140, out: 130 },
        Weekly: { stock: 550, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 550, out: 550 },
        Monthly: { stock: 2400, purchase: "₹22 Lakhs", sales: "₹20 Lakhs", in: 2300, out: 2200 },
      },
    },
    {
      name: "Gujarat",
      id: "Gujarat",
      data: {
        Daily: { stock: 90, purchase: "₹60K", sales: "₹40K", in: 90, out: 80 },
        Weekly: { stock: 600, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 600, out: 600 },
        Monthly: { stock: 2600, purchase: "₹25 Lakhs", sales: "₹21 Lakhs", in: 2500, out: 2400 },
      },
    },
    {
      name: "Bihar",
      id: "Bihar",
      data: {
        Daily: { stock: 110, purchase: "₹70K", sales: "₹60K", in: 100, out: 95 },
        Weekly: { stock: 500, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 500, out: 500 },
        Monthly: { stock: 2100, purchase: "₹18 Lakhs", sales: "₹16 Lakhs", in: 2000, out: 1900 },
      },
    },
    {
      name: "West Bengal",
      id: "West Bengal",
      data: {
        Daily: { stock: 200, purchase: "₹1.2 Lakhs", sales: "₹1 Lakh", in: 180, out: 170 },
        Weekly: { stock: "1K", purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: "1K", out: "1K" },
        Monthly: { stock: "5K", purchase: "₹50 Lakhs", sales: "₹45 Lakhs", in: "4.5K", out: "4K" },
      },
    },
    {
      name: "Telangana",
      id: "Telangana",
      data: {
        Daily: { stock: 50, purchase: "₹30K", sales: "₹25K", in: 50, out: 45 },
        Weekly: { stock: 100, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 100, out: 100 },
        Monthly: { stock: 800, purchase: "₹8 Lakhs", sales: "₹7 Lakhs", in: 750, out: 700 },
      },
    },
  ];

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm w-full overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-5">
        <div>
          <h3 className="text-[18px] font-semibold text-[#0F172A]">
            Branch Overview
          </h3>
          <p className="text-[13px] text-[#64748B] mt-1">
            Latest System Activities and updates
          </p>
        </div>

        {/* EDIT BUTTON */}
        <div className="flex items-center gap-3">
          <Link href="/super-admin/Branches/EditBranch">
            <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition">
              Edit Branch
            </button>
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-[#F8FAFC] text-left">
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
                  className="px-6 py-4 text-[13px] font-medium text-[#475569]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {branches.map((branch) => {
              const row = branch.data[period];

              return (
                <tr
                  key={branch.id}
                  className="hover:bg-[#F8FAFC] transition"
                >
                  <td className="px-6 py-4 font-medium text-[#0F172A] border border-[#E2E2E2]">
                    {branch.name}
                  </td>

                  <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                    {row.stock}
                  </td>
                  <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                    {row.purchase}
                  </td>
                  <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                    {row.sales}
                  </td>
                  <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                    {row.in}
                  </td>
                  <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                    {row.out}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
