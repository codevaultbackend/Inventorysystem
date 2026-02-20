"use client";

import { useState } from "react";
import Link from "next/link";

export default function BranchOverview() {
  /* ================= FILTER ================= */
  const [period, setPeriod] = useState("Weekly");

  /* ================= DATA ================= */
  const branches = [
    {
      name: "Mumbai Branch",
      id: "mumbai",
      state: "Inactive",
      data: {
        Daily: { stock: 120, purchase: "₹1 Lakh", sales: "₹80K", in: 120, out: 110 },
        Weekly: { stock: 500, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 500, out: 500 },
        Monthly: { stock: 2200, purchase: "₹20 Lakhs", sales: "₹18 Lakhs", in: 2100, out: 2000 },
      },
    },
    {
      name: "Kolkata Branch",
      id: "kolkata",
      state: "Inactive",
      data: {
        Daily: { stock: 150, purchase: "₹90K", sales: "₹70K", in: 140, out: 130 },
        Weekly: { stock: 550, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 550, out: 550 },
        Monthly: { stock: 2400, purchase: "₹22 Lakhs", sales: "₹20 Lakhs", in: 2300, out: 2200 },
      },
    },
    {
      name: "Bangalore Branch",
      id: "bangalore",
      state: "Active",
      data: {
        Daily: { stock: 200, purchase: "₹1.2 Lakhs", sales: "₹1 Lakh", in: 180, out: 170 },
        Weekly: { stock: "1K", purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: "1K", out: "1K" },
        Monthly: { stock: "5K", purchase: "₹50 Lakhs", sales: "₹45 Lakhs", in: "4.5K", out: "4K" },
      },
    },
    {
      name: "Hyderabad Branch",
      id: "hyderabad",
      state: "Inactive",
      data: {
        Daily: { stock: 50, purchase: "₹30K", sales: "₹25K", in: 50, out: 45 },
        Weekly: { stock: 100, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 100, out: 100 },
        Monthly: { stock: 800, purchase: "₹8 Lakhs", sales: "₹7 Lakhs", in: 750, out: 700 },
      },
    },
    {
      name: "Gurgaon Branch",
      id: "gurgaon",
      state: "Inactive",
      data: {
        Daily: { stock: 70, purchase: "₹40K", sales: "₹35K", in: 65, out: 60 },
        Weekly: { stock: 300, purchase: "₹5 Lakhs", sales: "₹5 Lakhs", in: 300, out: 300 },
        Monthly: { stock: 1400, purchase: "₹14 Lakhs", sales: "₹12 Lakhs", in: 1300, out: 1200 },
      },
    },
  ];

  /* ================= STATUS STYLE ================= */
  const getStateStyle = (state) => {
    if (state === "Active") return "text-green-600";
    return "text-red-500";
  };

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm w-full overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-5 border-b">
        <div>
          <h3 className="text-[18px] font-semibold text-[#0F172A]">
            Branch Overview
          </h3>
          <p className="text-[13px] text-[#64748B] mt-1">
            Latest System Activities and updates
          </p>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">

          

          {/* ADD BRANCH */}
          <Link href="/super-admin/Branches/edit-branch">
            <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition">
              Add Branch
            </button>
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
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
                "State",
              ].map((head) => (
                <th key={head} className="px-6 py-4 text-[13px] font-medium text-[#475569]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {branches.map((branch) => {
              const row = branch.data[period];

              return (
                <tr key={branch.id} className="border-b hover:bg-[#F8FAFC] transition">
                  <td className="px-6 py-4 font-medium text-[#0F172A] border border-[1px]  border-[#E2E2E2]">
                    {branch.name}
                  </td>

                  <td className="px-6 py-4 text-[#334155] border border-[1px]  border-[#E2E2E2]">{row.stock}</td>
                  <td className="px-6 py-4 text-[#334155] border border-[1px]  border-[#E2E2E2]">{row.purchase}</td>
                  <td className="px-6 py-4 text-[#334155] border border-[1px]  border-[#E2E2E2]">{row.sales}</td>
                  <td className="px-6 py-4 text-[#334155] border border-[1px]  border-[#E2E2E2]">{row.in}</td>
                  <td className="px-6 py-4 text-[#334155] border border-[1px]  border-[#E2E2E2]">{row.out}</td>

                  <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">
                    <Link
                      href={`/super-admin/Branches/${branch.id}`}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      View
                    </Link>
                  </td>

                  <td className={`px-6 py-4 font-medium ${getStateStyle(branch.state)}`}>
                    {branch.state}
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
