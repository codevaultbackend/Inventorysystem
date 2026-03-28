"use client";

import {
  ShoppingCart,
  FileText,
  TrendingUp,
  Users,
  IndianRupee,
  BarChart3,
} from "lucide-react";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { formatCurrency, formatNumber } from "@/app/lib/salesDashboardApi";

type CardItem = {
  title: string;
  value: number;
  icon: React.ElementType;
  type?: "number" | "currency";
  trend?: string;
  trendType?: "up" | "down" | "neutral";
};

type Props = {
  cards: CardItem[];
};

export default function BranchOverviewPage({ cards }: Props) {
  const renderValue = (item: CardItem) => {
    if (item.type === "currency") return formatCurrency(item.value);
    return formatNumber(item.value);
  };

  return (
    <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={`${item.title}-${index}`}
            className="
              group relative overflow-hidden
              rounded-[26px]
              border border-[#E7ECF2]
              bg-white
              px-[16px] pb-[14px] pt-[16px]
              shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_18px_rgba(16,24,40,0.06)]
              transition-all duration-200
              hover:shadow-[0_2px_6px_rgba(16,24,40,0.06),0_14px_28px_rgba(16,24,40,0.08)]
              min-h-[154px]
              sm:px-[18px] sm:pb-[16px] sm:pt-[16px]
              xl:min-h-[156px]
            "
            style={{
              borderRadius: "24px",
            }}
          >
            <div className="flex h-full flex-col">
              <div
                className="
                  mb-[18px]
                  flex h-[50px] w-[50px] items-center justify-center
                  rounded-[14px]
                  border border-[#EEF2F6]
                  bg-[#F4F7FB]
                  text-[#3B82F6]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]
                "
              >
                <Icon className="h-[22px] w-[22px] stroke-[2]" />
              </div>

              <div className="mt-auto">
                <p
                  className="
                    mb-[8px]
                    line-clamp-1
                    text-[14px] font-medium leading-[20px]
                    text-[#98A2B3]
                    tracking-[-0.01em]
                  "
                >
                  {item.title}
                </p>

                <div className="flex items-end justify-between gap-3">
                  <h3
                    className="
                      min-w-0 flex-1 truncate
                      text-[28px] font-semibold leading-[1.05]
                      tracking-[-0.03em]
                      text-[#111827]
                      sm:text-[30px]
                      xl:text-[29px]
                    "
                  >
                    {renderValue(item)}
                  </h3>

                  {item.trend ? (
                    <span
                      className={`mb-[4px] inline-flex shrink-0 items-center gap-[6px] text-[13px] font-semibold leading-none ${
                        item.trendType === "down"
                          ? "text-[#EF4444]"
                          : item.trendType === "neutral"
                          ? "text-[#94A3B8]"
                          : "text-[#22C55E]"
                      }`}
                    >
                      {item.trendType === "down" ? (
                        <FaArrowTrendDown className="h-[14px] w-[14px]" />
                      ) : item.trendType === "neutral" ? (
                        <FaArrowTrendUp className="h-[14px] w-[14px] opacity-70" />
                      ) : (
                        <FaArrowTrendUp className="h-[14px] w-[14px]" />
                      )}
                      <span className="whitespace-nowrap">{item.trend}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95),rgba(255,255,255,0))]" />
          </div>
        );
      })}
    </div>
  );
}

export const DashboardIcons = {
  ShoppingCart,
  FileText,
  TrendingUp,
  Users,
  IndianRupee,
  BarChart3,
};