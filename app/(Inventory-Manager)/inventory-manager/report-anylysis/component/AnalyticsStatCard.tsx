"use client";

import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trendText: string;
  trendColor: string;
};

export default function AnalyticsStatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trendText,
  trendColor,
}: Props) {
  return (
    <div className="rounded-[20px] border border-[#EAECF0] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px] sm:px-5">
      <div
        className={`flex h-[44px] w-[44px] items-center justify-center rounded-[10px] ${iconBg} sm:h-[48px] sm:w-[48px]`}
      >
        <Icon className={iconColor} size={22} strokeWidth={1.9} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-[500] leading-[18px] text-[#667085] sm:text-[13px]">
            {title}
          </p>
          <h3 className="mt-1 break-words text-[18px] font-[600] leading-[28px] tracking-[-0.02em] text-[#101828] sm:text-[24px] sm:leading-[32px] lg:text-[28px]">
            {value}
          </h3>
        </div>

        <div
          className={`text-[12px] font-[600] leading-[18px] sm:mb-[6px] sm:text-right sm:text-[14px] sm:leading-[20px] ${trendColor}`}
        >
          {trendText}
        </div>
      </div>
    </div>
  );
}