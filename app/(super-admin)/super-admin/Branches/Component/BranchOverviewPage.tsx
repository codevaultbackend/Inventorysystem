"use client";

import { Users, DollarSign, Settings, Calendar } from "lucide-react";

type Props = {
  stats?: {
    totalStock: number;
    totalStockValue: number;
    totalSales: number;
    agingItems: number;
  };
};
  
const formatValue = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

export default function BranchOverviewPage({ stats }: Props) {
  const cards = [
    {
      title: "Total Stock",
      value: formatValue(stats?.totalStock || 0),
      icon: Users,
      bg: "bg-[#EEF2FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Total Stock Value",
      value: formatValue(stats?.totalStockValue || 0),
      icon: DollarSign,
      bg: "bg-[#E0F2FE]",
      iconColor: "text-[#0284C7]",
    },
    {
      title: "Total Sales",
      value: formatValue(stats?.totalSales || 0),
      icon: Settings,
      bg: "bg-[#EEF2FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Aging Items",
      value: formatValue(stats?.agingItems || 0),
      icon: Calendar,
      bg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
    },
  ];

  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-2
        xl:grid-cols-4
        gap-4 sm:gap-5 lg:gap-6
      "
    >
      {cards.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="
              bg-white
              rounded-2xl
              border border-[#EEF2F6]
              shadow-[0_6px_20px_rgba(0,0,0,0.04)]
              p-4 sm:p-5 lg:p-6
              flex flex-col justify-between
              min-h-[130px] sm:min-h-[140px]
              transition-all duration-200
              hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]
            "
          >
            <div
              className={`
                ${item.bg}
                w-10 h-10 sm:w-11 sm:h-11
                rounded-xl
                flex items-center justify-center
              `}
            >
              <Icon
                className={`${item.iconColor} w-4 h-4 sm:w-5 sm:h-5`}
              />
            </div>

            <div className="mt-4 sm:mt-5">
              <p className="text-[12px] sm:text-[13px] text-[#767575] whitespace-nowrap overflow-hidden text-ellipsis">
                {item.title}
              </p>

              <div className="flex items-center justify-between mt-2">
                <h2 className="text-[22px] sm:text-[26px] lg:text-[28px] font-semibold text-[#0F172A] leading-none">
                  {item.value}
                </h2>

                <span className="flex items-center gap-1 text-[#16A34A] text-[11px] sm:text-[13px] font-medium whitespace-nowrap">
                  ↗ +12.5%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}