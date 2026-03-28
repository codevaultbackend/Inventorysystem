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
    style: "currency",
    currency: "INR",
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
  subtitle = "Latest system branch stock and sales summary",
  editHref,
}: Props) {
  const { setLocation } = useSuperDashboard();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "super_admin";
  const baseRoute = isSuperAdmin ? "/super-admin" : "/admin";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
      {/* top heading stays fixed */}
      <div className="flex items-center justify-between border-b border-[#EEF2F6] bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-[#0F172A] sm:text-[18px]">
            {title}
          </h3>
          <p className="mt-1 text-[12px] text-[#64748B] sm:text-[13px]">
            {subtitle}
          </p>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-3">
          {isSuperAdmin && (
            <Link href={editHref || `${baseRoute}/Branches/EditBranch`}>
              <button className="rounded-lg bg-blue-600 px-3 py-2 text-[13px] text-white transition hover:bg-blue-700 sm:px-4 sm:text-sm">
                Edit Branch
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* only this section scrolls horizontally + vertically */}
      <div className="max-h-[460px] overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="min-w-[1000px] w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-20">
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
                  className="whitespace-nowrap border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-[12px] font-medium text-[#475569] sm:px-6 sm:text-[13px]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="bg-white">
                  {Array.from({ length: 7 }).map((__, idx) => (
                    <td
                      key={idx}
                      className="border-b border-[#E2E8F0] px-4 py-4 sm:px-6"
                    >
                      <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
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
                    className="bg-white transition hover:bg-[#F8FAFC]"
                  >
                    <td className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-4 font-medium text-[#0F172A] sm:px-6">
                      {branch.name}
                    </td>

                    <td className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-4 text-[#334155] sm:px-6">
                      {formatNumber(branch.stock)}
                    </td>

                    <td className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-4 text-[#334155] sm:px-6">
                      {formatCurrency(branch.purchase)}
                    </td>

                    <td className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-4 text-[#334155] sm:px-6">
                      {formatCurrency(branch.sales)}
                    </td>

                    <td className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-4 text-[#334155] sm:px-6">
                      {formatNumber(branch.in)}
                    </td>

                    <td className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-4 text-[#334155] sm:px-6">
                      {formatNumber(branch.out)}
                    </td>

                    <td className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-4 sm:px-6">
                      <Link
                        href={resolvedHref}
                        onClick={() => {
                          if (isSuperAdmin) setLocation(branch.name);
                        }}
                        className="text-sm font-medium text-blue-600 hover:underline"
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
                  className="px-6 py-10 text-center text-sm text-[#64748B]"
                >
                  No branch overview data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}