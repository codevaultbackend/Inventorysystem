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
  value: string;
  label: string;
  top?: string;
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
      value: stats.monthlyRevenueTop,
      top: stats.monthlyRevenuePercent,
      label: stats.monthlyRevenueLabel,
      icon: CircleDollarSign,
      accentBg: "#DFF1EC",
      iconColor: "#22C55E",
      topColor: "#16A34A",
      showTrend: false,
    },
    {
      id: 2,
      value: String(stats.activeClients).padStart(2, "0"),
      top: stats.pendingThisWeekText,
      label: "Total Clients",
      icon: Users,
      accentBg: "#DFE8FB",
      iconColor: "#2563EB",
      topColor: "#6B7280",
      showTrend: false,
    },
    {
      id: 3,
      value: formatMoney(stats.pendingAmount),
      top: stats.pendingAmount > 0 ? "Needs follow-up" : "No pending dues",
      label: "Pending Amount",
      icon: Clock3,
      accentBg: "#FDEAD7",
      iconColor: "#EA580C",
      topColor: "#EA580C",
      showTrend: stats.pendingAmount > 0,
    },
    {
      id: 4,
      value: String(stats.todaysEntries).padStart(2, "0"),
      top:
        stats.todaysEntries > 0 ? "Recorded ledger entries" : "No entries yet",
      label: "Total Entries",
      icon: BookOpen,
      accentBg: "#F1E8FF",
      iconColor: "#9333EA",
      topColor: "#6B7280",
      showTrend: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-[14px] xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="
              group relative max-h-[154px] overflow-hidden
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
                className="mb-[18px] flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-[#EEF2F6] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                style={{ backgroundColor: card.accentBg }}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  style={{ color: card.iconColor }}
                  strokeWidth={2}
                />
              </div>

              <div className="mt-auto">
                <div className="min-h-[20px]">
                  {card.top ? (
                    card.showTrend ? (
                      <div className="inline-flex items-center gap-[6px] text-[13px] font-medium leading-[20px] tracking-[-0.01em] text-[#16A34A]">
                        <TrendingUp
                          className="h-[14px] w-[14px]"
                          strokeWidth={2.2}
                        />
                        <span className="line-clamp-1">{card.top}</span>
                      </div>
                    ) : (
                      <p
                        className="line-clamp-1 text-[13px] font-medium leading-[20px] tracking-[-0.01em]"
                        style={{ color: card.topColor }}
                      >
                        {card.top}
                      </p>
                    )
                  ) : null}
                </div>

                <h2 className="mt-[6px] truncate text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111827] sm:text-[30px] xl:text-[29px]">
                  {card.value}
                </h2>

                <p className="mt-[8px] line-clamp-1 text-[14px] font-medium leading-[20px] tracking-[-0.01em] text-[#98A2B3]">
                  {card.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}