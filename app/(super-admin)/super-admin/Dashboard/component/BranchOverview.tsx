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
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

export default function BranchOverview({
  data = [],
  loading = false,
  title = "Branch Overview",
  subtitle = "Latest system activities and updates",
}: Props) {
  const { setLocation } = useSuperDashboard();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "super_admin";
  const baseRoute = isSuperAdmin ? "/super-admin" : "/admin";

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EDF3] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.08),0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="border-b border-[#EDF2F7] px-5 py-5 flex justify-between">
        <div className=""><h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#171717]">
          {title}
        </h3>
          <p className="mt-1 text-[13px] leading-[18px] text-[#9AA0AA]">
            {subtitle}
          </p></div>

        <div>
          <Link href='/super-admin/Branches/EditBranch'>
            <button className="h-[50px] rounded-[8px] bg-blue-700 p-4 text-white">
              Edit Branch
            </button>
          </Link>
        </div>
      </div>

      <div className="max-h-[430px] overflow-auto">
        <table className="min-w-[820px] w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Branch Name",
                "Stock Items",
                "Purchase",
                "Sale",
                "Stock IN",
                "Stock OUT",
                "Action",
              ].map((head) => (
                <th
                  key={head}
                  className="border-b border-r border-[#E7EDF4] bg-[#F8FAFC] px-6 py-4 text-left text-[14px] font-semibold text-[#171717] last:border-r-0"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-white">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-b border-r border-[#E7EDF4] px-6 py-4 last:border-r-0"
                    >
                      <div className="h-4 w-full animate-pulse rounded bg-[#EEF2F7]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((branch) => {
                const resolvedHref =
                  branch.href || `${baseRoute}/Branches/${encodeURIComponent(branch.id)}`;

                return (
                  <tr key={branch.id} className="bg-white hover:bg-[#FBFDFF]">
                    <td className="border-b border-r border-[#E7EDF4] px-6 py-4 text-[15px] font-medium text-[#171717] last:border-r-0">
                      {branch.name}
                    </td>
                    <td className="border-b border-r border-[#E7EDF4] px-6 py-4 text-[15px] text-[#171717] last:border-r-0">
                      {formatNumber(branch.stock)}
                    </td>
                    <td className="border-b border-r border-[#E7EDF4] px-6 py-4 text-[15px] text-[#171717] last:border-r-0">
                      {formatCurrency(branch.purchase)}
                    </td>
                    <td className="border-b border-r border-[#E7EDF4] px-6 py-4 text-[15px] text-[#171717] last:border-r-0">
                      {formatCurrency(branch.sales)}
                    </td>
                    <td className="border-b border-r border-[#E7EDF4] px-6 py-4 text-[15px] text-[#171717] last:border-r-0">
                      {formatNumber(branch.in)}
                    </td>
                    <td className="border-b border-r border-[#E7EDF4] px-6 py-4 text-[15px] text-[#171717] last:border-r-0">
                      {formatNumber(branch.out)}
                    </td>
                    <td className="border-b border-[#E7EDF4] px-6 py-4 text-[15px] last:border-r-0">
                      <Link
                        href={resolvedHref}
                        onClick={() => isSuperAdmin && setLocation(branch.name)}
                        className="font-medium text-[#2563EB] underline underline-offset-2"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#64748B]">
                  No branch overview data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}