"use client";

import { ShoppingCart, FileText, TrendingUp, Users, IndianRupee, BarChart3 } from "lucide-react";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={`${item.title}-${index}`}
            className="rounded-[24px] border border-[#E6ECF2] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          >
            <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#2F80ED]">
              <Icon className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <p className="text-[14px] font-medium text-[#8A94A6]">{item.title}</p>

              <div className="flex items-end justify-between gap-3">
                <h3 className="truncate text-[24px] font-semibold leading-none text-[#111827] md:text-[26px]">
                  {renderValue(item)}
                </h3>

                {item.trend ? (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold ${
                      item.trendType === "down"
                        ? "text-[#EF4444]"
                        : item.trendType === "neutral"
                        ? "text-[#94A3B8]"
                        : "text-[#22C55E]"
                    }`}
                  >
                    {item.trendType === "down" ? (
                      <FaArrowTrendDown className="h-3.5 w-3.5" />
                    ) : (
                      <FaArrowTrendUp className="h-3.5 w-3.5" />
                    )}
                    {item.trend}
                  </span>
                ) : null}
              </div>
            </div>
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