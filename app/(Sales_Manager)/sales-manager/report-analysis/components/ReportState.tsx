"use client";

import { DollarSign, Target, ShoppingCart, Users } from "lucide-react";

type Props = {
  cards: {
    revenue: number;
    avgOrderValue: number;
    totalOrders: number;
    activeClients: number;
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export default function ReportState({ cards }: Props) {
  const stateData = [
    {
      icon: DollarSign,
      trend: "",
      trendColor: "text-green-600",
      label: "Total Revenue",
      value: formatCurrency(cards.revenue),
      bg: "bg-[#EEF4FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      icon: Target,
      trend: "",
      trendColor: "text-red-500",
      label: "Avg. Order Value",
      value: formatCurrency(cards.avgOrderValue),
      bg: "bg-[#FFF7ED]",
      iconColor: "text-[#F97316]",
    },
    {
      icon: ShoppingCart,
      trend: "",
      trendColor: "text-green-600",
      label: "Total Orders",
      value: String(cards.totalOrders),
      bg: "bg-[#ECFDF3]",
      iconColor: "text-[#16A34A]",
    },
    {
      icon: Users,
      trend: "",
      trendColor: "text-green-600",
      label: "Active Clients",
      value: String(cards.activeClients),
      bg: "bg-[#F5F3FF]",
      iconColor: "text-[#9333EA]",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
      {stateData.map((state, index) => {
        const Icon = state.icon;

        return (
          <div
            key={index}
            className="
              group relative max-h-[153px] overflow-hidden
              rounded-[26px] border border-[#E7ECF2] bg-white
              px-[16px] pb-[14px] pt-[16px]
              shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_18px_rgba(16,24,40,0.06)]
              transition-all duration-200
              hover:shadow-[0_2px_6px_rgba(16,24,40,0.06),0_14px_28px_rgba(16,24,40,0.08)]
              sm:px-[18px] sm:pb-[16px] sm:pt-[16px]
              xl:max-h-[153px]
            "
            style={{ borderRadius: "24px" }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95),rgba(255,255,255,0))]" />

            <div className="flex h-full flex-col">
              <div
                className={`mb-[18px] flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-[#EEF2F6] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${state.bg}`}
              >
                <Icon
                  className={`h-[22px] w-[22px] ${state.iconColor}`}
                  strokeWidth={2}
                />
              </div>

              <div className="mt-auto">
                <div className="min-h-[20px]">
                  {state.trend ? (
                    <span
                      className={`line-clamp-1 text-[13px] font-medium leading-[20px] tracking-[-0.01em] ${state.trendColor}`}
                    >
                      {state.trend}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-[6px] break-words text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111827] sm:text-[30px] xl:text-[29px]">
                  {state.value}
                </h3>

                <p className="mt-[8px] line-clamp-1 text-[14px] font-medium leading-[20px] tracking-[-0.01em] text-[#98A2B3]">
                  {state.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}