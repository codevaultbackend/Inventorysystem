"use client";

import { formatNumber } from "@/app/lib/formatNumber";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StockCountProps {
  title: string;
  value: string | number;
  percentage?: number;
  icon: LucideIcon;
  trend?: "up" | "down";
  iconBgColor?: string;
}

export default function StockCount({
  title,
  value,
  percentage,
  icon: Icon,
  trend = "up",
  iconBgColor = "#E8F1FF",
}: StockCountProps) {
  return (
    <div
      className="
        bg-white
        rounded-[20px]
        h-[153px]
        p-4
        sm:p-5
        md:p-6
        border border-[#EEF2F6]
        shadow-[1px_1px_4px_rgba(0,0,0,0.1)]
        transition-all
        hover:shadow-[0px_10px_28px_rgba(17,24,39,0.06)]
        w-full
      "
    >
      <div className="flex items-start justify-between gap-3">

        {/* LEFT SECTION */}
        <div className="space-y-2 sm:space-y-3">

          {/* Icon */}
          <div
            className="
              h-[36px] w-[36px]
              sm:h-[40px] sm:w-[40px]
              md:h-[44px] md:w-[44px]
              rounded-[12px]
              flex
              items-center
              justify-center
            "
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2563EB]" />
          </div>

          {/* Title */}
          <p
            className="
              text-[12px]
              sm:text-[13px]
              md:text-[14px]
              text-[#6B7280]
              font-[500]
              leading-none
            "
          >
            {title}
          </p>

          {/* Value */}
          <h2
            className="
              text-[28px]
              max-[768px]::text-[22px]
              font-[500]
              text-[#000000]
              tracking-tight
              break-all
            "
          >
            {formatNumber(value)}
          </h2>
        </div>

        {/* RIGHT SECTION */}
        {percentage !== undefined && (
          <div
            className={`
              flex
              items-center
              gap-1
              text-[12px]
              sm:text-[13px]
              md:text-[14px]
              font-[600]
              whitespace-nowrap
              ₹{
                trend === "up"
                  ? "text-[#16A34A]"
                  : "text-[#DC2626]"
              }
            `}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );
}