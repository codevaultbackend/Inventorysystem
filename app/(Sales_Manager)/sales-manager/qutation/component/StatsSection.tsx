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
    <div className="mb-5 grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
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
    <div
      className="
        group relative max-h-[153px] overflow-hidden
        rounded-[26px] border border-[#E7ECF2] bg-white
        px-[16px] pb-[14px] pt-[16px]
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_18px_rgba(16,24,40,0.06)]
        transition-all duration-200
        hover:shadow-[0_2px_6px_rgba(16,24,40,0.06),0_14px_28px_rgba(16,24,40,0.08)]
        sm:px-[18px] sm:pb-[16px] sm:pt-[16px]
        xl:min-h-[156px]
      "
      style={{ borderRadius: "24px" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95),rgba(255,255,255,0))]" />

      <div className="flex h-full flex-col">
        <div
          className={`mb-[18px] flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-[#EEF2F6] bg-[#F4F7FB] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${iconBg}`}
        >
          <span className={`text-[22px] ${iconColor}`}>{icon}</span>
        </div>

        <div className="mt-auto">
          <div className="min-h-[20px]">
            {sub ? (
              <p
                className={`line-clamp-1 text-[13px] font-medium leading-[20px] tracking-[-0.01em] ${subColor}`}
              >
                {sub}
              </p>
            ) : null}
          </div>

          <p className="mt-[6px] truncate text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111827] sm:text-[30px] xl:text-[29px]">
            {value}
          </p>

          <p className="mt-[8px] line-clamp-1 text-[14px] font-medium leading-[20px] tracking-[-0.01em] text-[#98A2B3]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}