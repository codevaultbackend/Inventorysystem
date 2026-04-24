"use client";

import Link from "next/link";
import { useSuperDashboard } from "../../../../context/SuperDashboardContext";
import { useAuth } from "@/app/context/AuthContext";

type BranchItem = {
  name: string;
  id: string;
  stock: number;
  purchase: number;
  sales: number;
  in: number;
  out: number;
  href?: string;
};

type Props = {
  data?: BranchItem[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  editHref?: string;
};

function formatCurrency(value: number) {
  return `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

export default function BranchOverview({
  data = [],
  loading = false,
  title = "Branch Overview",
  subtitle = "Latest System Activities and updates",
  editHref = "/super-admin/Branches/EditBranch",
}: Props) {
  const { setLocation } = useSuperDashboard();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "super_admin";
  const baseRoute = isSuperAdmin ? "/super-admin" : "/admin";

  return (
    <section className="w-full overflow-hidden rounded-[20px] border border-[#E8EDF3] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.08),0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex min-h-[88px] flex-col gap-4 border-b border-[#EDF2F7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#171717]">
            {title}
          </h3>
          <p className="mt-1 text-[13px] leading-[18px] text-[#9AA0AA]">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={editHref}>
            <button className="h-[40px] rounded-[8px] bg-[#0B5CAB] px-5 text-[14px] font-medium text-white transition hover:bg-[#084F93] cursor-pointer">
              Edit Branch
            </button>
          </Link>
        </div>
      </div>

      <div className="relative h-[390px] w-full overflow-hidden">
        <div className="custom-branch-scroll h-full w-full cursor-grab overflow-auto active:cursor-grabbing">
          <table className="w-full min-w-[1050px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr>
                {[
                  "Branch Name",
                  "Stock Items",
                  "Purchase",
                  "Sales",
                  "Stock IN",
                  "Stock OUT",
                  "Action",
                ].map((head, index) => (
                  <th
                    key={head}
                    className={`h-[48px] border-b border-[#E7EDF4] bg-[#F6FAFD] px-6 text-left text-[14px] font-semibold leading-[20px] text-[#111827] ${
                      index === 0 ? "sticky left-0 z-30" : ""
                    }`}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="bg-white">
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`h-[52px] border-b border-[#E7EDF4] px-6 ${
                          cellIndex === 0 ? "sticky left-0 z-10 bg-white" : ""
                        }`}
                      >
                        <div className="h-4 w-full animate-pulse rounded bg-[#EEF2F7]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((branch) => {
                  const resolvedHref =
                    branch.href ||
                    `${baseRoute}/Branches/${encodeURIComponent(branch.id)}`;

                  return (
                    <tr
                      key={branch.id}
                      className="group bg-white transition hover:bg-[#FBFDFF]"
                    >
                      <td className="sticky left-0 z-10 h-[52px] border-b border-[#E7EDF4] bg-white px-6 text-[14px] font-semibold leading-[20px] text-[#111827] group-hover:bg-[#FBFDFF]">
                        {branch.name}
                      </td>

                      <td className="h-[52px] border-b border-[#E7EDF4] px-6 text-[14px] font-medium leading-[20px] text-[#111827]">
                        {formatNumber(branch.stock)}
                      </td>

                      <td className="h-[52px] border-b border-[#E7EDF4] px-6 text-[14px] font-medium leading-[20px] text-[#111827]">
                        {formatCurrency(branch.purchase)}
                      </td>

                      <td className="h-[52px] border-b border-[#E7EDF4] px-6 text-[14px] font-medium leading-[20px] text-[#111827]">
                        {formatCurrency(branch.sales)}
                      </td>

                      <td className="h-[52px] border-b border-[#E7EDF4] px-6 text-[14px] font-medium leading-[20px] text-[#111827]">
                        {formatNumber(branch.in)}
                      </td>

                      <td className="h-[52px] border-b border-[#E7EDF4] px-6 text-[14px] font-medium leading-[20px] text-[#111827]">
                        {formatNumber(branch.out)}
                      </td>

                      <td className="h-[52px] border-b border-[#E7EDF4] px-6 text-[14px] leading-[20px]">
                        <Link
                          href={resolvedHref}
                          onClick={() => isSuperAdmin && setLocation(branch.name)}
                          className="font-medium text-[#0B66D8] underline underline-offset-2 transition hover:text-[#084F93]"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="h-[180px] px-6 text-center text-sm font-medium text-[#64748B]"
                  >
                    No branch overview data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .custom-branch-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .custom-branch-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-branch-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-branch-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .custom-branch-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
}