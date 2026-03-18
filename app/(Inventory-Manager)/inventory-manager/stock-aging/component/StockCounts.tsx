"use client";

import { ArrowUpRight, LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
};

const iconStyles: Record<string, string> = {
  "Total Items": "bg-[#F8FAFC] text-[#101828]",
  "Fresh Stocks": "bg-[#ECFDF3] text-[#22C55E]",
  Critical: "bg-[#FEF3F2] text-[#F04438]",
  "Average Aging": "bg-[#F4E8FF] text-[#A855F7]",
};

export default function StockCount({ title, value, icon: Icon }: Props) {
  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-5">
      <div
        className={`flex h-[46px] w-[46px] items-center justify-center rounded-[12px] sm:h-[52px] sm:w-[52px] ${
          iconStyles[title] ?? "bg-[#F8FAFC] text-[#101828]"
        }`}
      >
        <Icon size={22} strokeWidth={1.9} className="sm:h-6 sm:w-6" />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-[500] leading-[18px] text-[#98A2B3] sm:text-[13px]">
            {title}
          </p>
          <h3 className="mt-1 break-words text-[18px] font-[600] leading-[28px] tracking-[-0.02em] text-[#111827] sm:text-[24px] sm:leading-[32px] md:text-[28px]">
            {value}
          </h3>
        </div>

        <div className="inline-flex items-center gap-1 text-[12px] font-[600] text-[#22C55E] sm:mb-1 sm:text-[14px]">
          <ArrowUpRight size={15} className="sm:h-4 sm:w-4" />
          +12.5%
        </div>
      </div>
    </div>
  );
}