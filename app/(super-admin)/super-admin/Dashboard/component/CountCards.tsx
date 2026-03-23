"use client";

import {
  Users,
  Boxes,
  Building2,
  TrendingUp,
} from "lucide-react";
import { BsBoxSeam } from "react-icons/bs";
import { LuBadgePercent } from "react-icons/lu";
import { FaChartLine } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

type DashboardProps = {
  data?: {
    stats?: {
      totalUsers?: number | string;
      totalStock?: number | string;
      totalBranches?: number | string;
      totalStockValue?: number | string;
    };
  };
  loading?: boolean;
};

type StatsItem = {
  title: string;
  value: string | number;
  icon: LucideIcon | IconType;
  iconWrap: string;
  iconColor: string;
  isCurrency?: boolean;
};

function formatNumber(value: number | string, isCurrency = false) {
  const num = Number(value);
  if (!Number.isFinite(num)) return isCurrency ? "₹0" : "0";

  if (isCurrency) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(num);
  }

  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

export default function DashboardStats({
  data,
  loading = false,
}: DashboardProps) {
  const stats: StatsItem[] = [
    {
      title: "Total Users",
      value: data?.stats?.totalUsers ?? 0,
      icon: Users,
      iconWrap: "bg-[#EEF5FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      title: "Total Stock",
      value: data?.stats?.totalStock ?? 0,
      icon: BsBoxSeam,
      iconWrap: "bg-[#EEF9F2]",
      iconColor: "text-[#22C55E]",
    },
    {
      title: "Total Branches",
      value: data?.stats?.totalBranches ?? 0,
      icon: LuBadgePercent,
      iconWrap: "bg-[#F5F3FF]",
      iconColor: "text-[#8B5CF6]",
    },
    {
      title: "Total Stock Value",
      value: data?.stats?.totalStockValue ?? 0,
      icon: FaChartLine,
      iconWrap: "bg-[#FFF4E8]",
      iconColor: "text-[#F97316]",
      isCurrency: true,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => (
        <div
          key={index}
          className="
            rounded-[22px] border border-[#E8EEF4] bg-white
            px-5 py-5 sm:px-6 sm:py-6
            shadow-[0px_10px_30px_rgba(15,23,42,0.05)]
            transition-all duration-200 shadow-[1px_1px_4px_rgba(0,0,0,0.1)]
            hover:-translate-y-[1px] hover:shadow-[0px_16px_40px_rgba(15,23,42,0.07)]
          "
        >
          <div className="flex items-start justify-between gap-4 flex-col-reverse">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#8A94A6]">
                {item.title}
              </p>

              <div className="mt-3">
                {loading ? (
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-[#EEF2F7]" />
                ) : (
                  <h2 className="truncate text-[30px] font-semibold leading-none tracking-[-0.03em] text-[#111827]">
                    {formatNumber(item.value, item.isCurrency)}
                  </h2>
                )}
              </div>
            </div>

            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] ${item.iconWrap}`}
            >
              <item.icon className={`h-6 w-6 ${item.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}