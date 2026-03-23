"use client";

import {
  HiOutlineDocumentText,
  HiOutlineClock,
} from "react-icons/hi";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";

interface StatsData {
  totalQuotations: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  pendingThisWeek: number;
  approvedCount: number;
  rejectedCount: number;
}

interface Props {
  stats: StatsData;
}

function formatCurrency(value: number) {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)}`;
}

export default function StatsSection({ stats }: Props) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Quotations"
        value={String(stats.totalQuotations)}
        sub={formatCurrency(stats.totalAmount)}
        icon={<HiOutlineDocumentText />}
        iconBg="bg-[#EEF2FF]"
        iconColor="text-[#4F46E5]"
        subColor="text-[#2563EB]"
      />

      <StatCard
        label="Pending Quotations"
        value={String(stats.pendingCount)}
        sub={`${stats.pendingThisWeek} this week`}
        icon={<HiOutlineClock />}
        iconBg="bg-[#FFF7ED]"
        iconColor="text-[#EA580C]"
        subColor="text-[#F59E0B]"
      />

      <StatCard
        label="Approved Quotations"
        value={String(stats.approvedCount)}
        sub={stats.approvedCount > 0 ? "Approved successfully" : undefined}
        icon={<BsCheckCircle />}
        iconBg="bg-[#E8F7EF]"
        iconColor="text-[#16A34A]"
        subColor="text-[#22C55E]"
      />

      <StatCard
        label="Rejected Quotations"
        value={String(stats.rejectedCount)}
        sub={stats.rejectedCount > 0 ? "Needs review" : undefined}
        icon={<BsXCircle />}
        iconBg="bg-[#FCEBEC]"
        iconColor="text-[#DC2626]"
        subColor="text-[#EF4444]"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  subColor: string;
}) {
  return (
    <div className="flex h-auto min-h-[96px] items-center justify-between rounded-[14px] bg-white px-5 py-4 shadow-sm">
      <div className="min-w-0">
        {sub && (
          <p className={`mb-1 text-[12px] font-medium ${subColor}`}>{sub}</p>
        )}

        <p className="text-[24px] font-semibold leading-none text-[#111827]">
          {value}
        </p>

        <p className="mt-2 text-[13px] text-[#6B7280]">{label}</p>
      </div>

      <div
        className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-[20px] ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
    </div>
  );
}