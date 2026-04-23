"use client";

import React from "react";
import {
  ShoppingCart,
  FileText,
  TrendingUp,
  Users,
  IndianRupee,
  BadgeDollarSign,
  BarChart3,
  Settings2,
  Boxes,
  Package,
  LucideIcon,
} from "lucide-react";

export const DashboardIcons = {
  ShoppingCart,
  FileText,
  TrendingUp,
  Users,
  IndianRupee,
  BadgeDollarSign,
  BarChart3,
  Settings2,
  Boxes,
  Package,
} as const satisfies Record<string, LucideIcon>;

export type DashboardCardItem = {
  title: string;
  value: number | string;
  icon?: LucideIcon | null;
  trend?: string;
  trendType?: "up" | "down";
};

type Props = {
  cards?: DashboardCardItem[];
  loading?: boolean;
};

function formatCardValue(value: number | string) {
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-IN").format(value);
}

function CardSkeleton() {
  return (
    <div className="rounded-[22px] border border-[#E8EDF3] bg-white p-5 shadow-[0px_8px_24px_rgba(16,24,40,0.06)]">
      <div className="flex h-full min-h-[132px] flex-col">
        <div className="h-[48px] w-[48px] animate-pulse rounded-[12px] bg-[#F2F4F7]" />
        <div className="mt-auto">
          <div className="h-4 w-24 animate-pulse rounded bg-[#F2F4F7]" />
          <div className="mt-4 h-9 w-28 animate-pulse rounded bg-[#F2F4F7]" />
          <div className="mt-4 h-4 w-20 animate-pulse rounded bg-[#F2F4F7]" />
        </div>
      </div>
    </div>
  );
}

function SafeIcon({ icon: Icon }: { icon?: LucideIcon | null }) {
  const FinalIcon = Icon ?? ShoppingCart;
  return <FinalIcon className="h-[22px] w-[22px] stroke-[2] text-[#2F80ED]" />;
}

export default function BranchOverviewPage({
  cards = [],
  loading = false,
}: Props) {
  const safeCards = Array.isArray(cards) ? cards : [];
  const shouldShowSkeletons = loading || safeCards.length === 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {shouldShowSkeletons
        ? Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        : safeCards.map((card, index) => {
            const isDown = card?.trendType === "down";

            return (
              <div
                key={`${card?.title || "card"}-${index}`}
                className="rounded-[22px] border border-[#E8EDF3] bg-white p-5 shadow-[1px_1px_4px_rgba(0,0,0,0.1)]"
              >
                <div className="flex h-full min-h-[132px] flex-col">
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-[#F8FBFF]">
                    <SafeIcon icon={card?.icon} />
                  </div>

                  <div className="mt-auto">
                    <p className="text-[14px] font-medium leading-[20px] text-[#98A2B3]">
                      {card?.title || "-"}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <h3 className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-[#111827]">
                        {formatCardValue(card?.value ?? 0)}
                      </h3>

                      {card?.trend ? (
                        <div
                          className={`flex items-center gap-1 text-[14px] font-semibold ${
                            isDown ? "text-[#F04438]" : "text-[#22C55E]"
                          }`}
                        >
                          <TrendingUp
                            className={`h-4 w-4 ${isDown ? "rotate-180" : ""}`}
                          />
                          <span>{card.trend}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );
}