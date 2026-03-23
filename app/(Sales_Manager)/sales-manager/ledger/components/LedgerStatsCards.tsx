"use client";

import {
  BookOpen,
  CircleDollarSign,
  Clock3,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatMoney } from "../data/ledgerData";

type Props = {
  stats: {
    monthlyRevenueTop: string;
    monthlyRevenuePercent: string;
    monthlyRevenueLabel: string;
    activeClients: number;
    pendingAmount: number;
    pendingThisWeekText: string;
    todaysEntries: number;
    totalRevenue: number;
  };
};

type LedgerCard = {
  id: number;
  top: string;
  value: string;
  label: string;
  icon: LucideIcon;
  accentBg: string;
  iconColor: string;
  topColor: string;
  showTrend: boolean;
};

export default function LedgerStatsCards({ stats }: Props) {
  const cards: LedgerCard[] = [
    {
      id: 1,
      top: stats.monthlyRevenueTop,
      value: stats.monthlyRevenuePercent,
      label: stats.monthlyRevenueLabel,
      icon: CircleDollarSign,
      accentBg: "#DFF1EC",
      iconColor: "#7ABFAF",
      topColor: "#22C55E",
      showTrend: false,
    },
    {
      id: 2,
      top: "",
      value: String(stats.activeClients).padStart(2, "0"),
      label: "Active Client",
      icon: Users,
      accentBg: "#DFE8FB",
      iconColor: "#7A98EE",
      topColor: "#6B7280",
      showTrend: false,
    },
    {
      id: 3,
      top: stats.pendingThisWeekText,
      value: formatMoney(stats.pendingAmount),
      label: "Pending Ammount",
      icon: Clock3,
      accentBg: "#F5E7C8",
      iconColor: "#D79A25",
      topColor: "#16A34A",
      showTrend: true,
    },
    {
      id: 4,
      top: "",
      value: String(stats.todaysEntries).padStart(2, "0"),
      label: "Today’s Entries",
      icon: BookOpen,
      accentBg: "#EDD9F8",
      iconColor: "#A020F0",
      topColor: "#6B7280",
      showTrend: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="relative h-[112px] overflow-hidden rounded-[16px] border border-[#E9EEF5] bg-white px-[20px] pt-[16px] pb-[15px] shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
          >
            <div
              className="absolute -top-[30px] right-[-4px] h-[118px] w-[118px] rounded-full"
              style={{ backgroundColor: card.accentBg }}
            />

            <div className="absolute right-[24px] top-[21px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <Icon
                className="h-[18px] w-[18px]"
                style={{ color: card.iconColor }}
                strokeWidth={2}
              />
            </div>

            <div className="relative z-10 flex h-full flex-col">
              <div className="min-h-[18px]">
                {card.top ? (
                  card.showTrend ? (
                    <div className="flex items-center gap-[4px] text-[13px] font-medium leading-[16px] text-[#16A34A]">
                      <TrendingUp className="h-[13px] w-[13px]" strokeWidth={2.2} />
                      <span>{card.top}</span>
                    </div>
                  ) : (
                    <p
                      className="text-[13px] font-medium leading-[16px]"
                      style={{ color: card.topColor }}
                    >
                      {card.top}
                    </p>
                  )
                ) : null}
              </div>

              <h2 className="mt-[6px] text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#202124]">
                {card.value}
              </h2>

              <p className="mt-[4px] text-[13px] font-medium leading-[18px] text-[#5F6368]">
                {card.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}