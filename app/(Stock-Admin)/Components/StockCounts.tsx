"use client";

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
        rounded-[18px]
        p-6
        border border-[#EEF2F6]
        shadow-[0px_6px_20px_rgba(17,24,39,0.04)]
        transition-all
        hover:shadow-[0px_10px_28px_rgba(17,24,39,0.06)]
        w-full
      "
    >
      <div className="flex items-start justify-between">
        {/* LEFT SECTION */}
        <div className="space-y-3">
          {/* Icon */}
          <div
            className="h-[44px] w-[44px] rounded-[12px] flex items-center justify-center"
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="h-5 w-5 text-[#2563EB]" />
          </div>

          {/* Title */}
          <p className="text-[14px] text-[#6B7280] font-[500]">
            {title}
          </p>

          {/* Value */}
          <h2 className="text-[28px] font-[700] text-[#111827] tracking-tight">
            {value}
          </h2>
        </div>

        {/* RIGHT SECTION */}
        {percentage !== undefined && (
          <div
            className={`
              flex items-center gap-1
              text-[14px]
              font-[600]
              ${
                trend === "up"
                  ? "text-[#16A34A]"
                  : "text-[#DC2626]"
              }
            `}
          >
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );
}