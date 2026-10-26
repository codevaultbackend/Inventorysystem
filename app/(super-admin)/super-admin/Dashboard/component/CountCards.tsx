"use client";

import { Users } from "lucide-react";
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
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  }

  return new Intl.NumberFormat("en-IN").format(num);
}

export default function DashboardStats({ data, loading = false }: DashboardProps) {
  const stats: StatsItem[] = [
    {
      title: "Total Users",
      value: data?.stats?.totalUsers ?? 0,
      icon: Users,
      iconWrap: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      title: "Total Stock",
      value: data?.stats?.totalStock ?? 0,
      icon: BsBoxSeam,
      iconWrap: "bg-[#EEF7FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      title: "Total Branches",
      value: data?.stats?.totalBranches ?? 0,
      icon: LuBadgePercent,
      iconWrap: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      title: "Total Stock Value",
      value: data?.stats?.totalStockValue ?? 0,
      icon: FaChartLine,
      iconWrap: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
      isCurrency: true,
    },
  ];

  return (
    <section className="grid grid-cols-4 max-[768px]:grid-cols-2 gap-4  2xl:grid-cols-4">
      {stats.map((item, index) => (
        <article
          key={index}
          className="min-h-[160px] rounded-[20px] border border-[#E8EDF3] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.08),0_1px_2px_rgba(16,24,40,0.04)] sm:px-5 sm:py-5"
        >
          <div className="flex h-full flex-col justify-between">
            <div
              className={`flex h-[50px] w-[50px] items-center justify-center rounded-[12px] ${item.iconWrap}`}
            >
              <item.icon className={`h-[24px] w-[24px] ${item.iconColor}`} strokeWidth={2} />
            </div>

            <div className="pt-8">
              <p className="text-[12px] font-[400] leading-[20px] text-[#949494]">
                {item.title}
              </p>

              {loading ? (
                <div className="mt-3 h-10 w-28 animate-pulse rounded-lg bg-[#EEF2F7]" />
              ) : (
                <h2 className="mt-2 text-[28px] font-[500] leading-[34px] tracking-[-0.02em] text-[#000000] md:text-[32px]">
                  {formatNumber(item.value, item.isCurrency)}
                </h2>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}