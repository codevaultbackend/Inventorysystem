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
    <div className="bg-white rounded-2xl  shadow-[1px_1px_4px_rgba(0,0,0,0.1)]  border border-[#EEF2F6]  w-full max-h-[541px] overflow-y-scroll">
      <div className="flex justify-between items-center px-6 py-5">
        <div>
          <h3 className="text-[18px] font-semibold text-[#0F172A]">
            {title}
          </h3>
          <p className="text-[13px] text-[#64748B] mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Link href={editHref || `${baseRoute}/Branches/EditBranch`}>
              <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition">
                Edit Branch
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto active:cursor-grabbing">
        <table className="w-full min-w-[900px]  ">
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
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 7 }).map((__, idx) => (
                    <td
                      key={idx}
                      className="px-6 py-4 border border-[#E2E2E2]"
                    >
                      <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((branch) => {
                const resolvedHref =
                  branch.href || `${baseRoute}/Branches/${encodeURIComponent(branch.id)}`;

                return (
                  <tr key={branch.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="px-6 py-4 font-medium text-[#0F172A] border border-[#E2E2E2]">
                      {branch.name}
                    </td>

                    <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                      {formatNumber(branch.stock)}
                    </td>

                    <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                      {formatCurrency(branch.purchase)}
                    </td>

                    <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                      {formatCurrency(branch.sales)}
                    </td>

                    <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                      {formatNumber(branch.in)}
                    </td>

                    <td className="px-6 py-4 text-[#334155] border border-[#E2E2E2]">
                      {formatNumber(branch.out)}
                    </td>

                    <td className="px-6 py-4 border border-[#E2E2E2]">
                      <Link
                        href={resolvedHref}
                        onClick={() => {
                          if (isSuperAdmin) setLocation(branch.name);
                        }}
                        className="text-blue-600 text-sm font-medium hover:underline"
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