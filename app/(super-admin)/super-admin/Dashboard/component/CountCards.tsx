"use client";

import {
  Users,
  Boxes,
  Building2,
  TrendingUp,
  LucideIcon,
} from "lucide-react";

import { DashboardProps } from "../../../../types/dashboard";

type StatsItem = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  growth?: string;
};

export default function DashboardStats({
  data,
  loading,
}: DashboardProps) {

  function formatNumber(value: number | string) {
    const num = Number(value);

    if (isNaN(num)) return value;

    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
    }

    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(".0", "") + "M";
    }

    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(".0", "") + "K";
    }

    return num.toString();
  }

  const stats: StatsItem[] = [
    {
      title: "Total Users",
      value: data?.stats?.totalUsers ?? "0",
      icon: Users,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Stock",
      value: data?.stats?.totalStock ?? "0",
      icon: Boxes,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      growth: "+12.5%",
    },
    {
      title: "Total Branches",
      value: data?.stats?.totalBranches ?? "0",
      icon: Building2,
      bg: "bg-gray-100",
      iconColor: "text-gray-700",
    },
    {
      title: "Total Stock Value",
      value: data?.stats?.totalStockValue ?? "0",
      icon: TrendingUp,
      bg: "bg-green-50",
      iconColor: "text-green-600",
      growth: "+12.5%",
    },
  ];

  return (
    <section
      className="
      grid 
      grid-cols-2 
      sm:grid-cols-2 
      md:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      gap-4 
      md:gap-6
    "
    >
      {stats.map((item, index) => (
        <div
          key={index}
          className="
          bg-white
          rounded-2xl
          border border-gray-100
          shadow-[0_8px_30px_rgba(0,0,0,0.04)]
          p-4
          sm:p-5
          md:p-6
          flex
          items-center
          justify-between
          min-h-[100px]

          max-[640px]:flex-col-reverse
          max-[640px]:items-start
          max-[640px]:gap-3
        "
        >
          {/* LEFT CONTENT */}
          <div className="flex flex-col gap-1 w-full">

            <p className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
              {item.title}
            </p>

            <h2
              className="
              text-xl
              sm:text-2xl
              md:text-3xl
              font-semibold
              text-gray-900
              tracking-tight
              break-all
            "
            >
              {loading ? "..." : formatNumber(item.value)}
            </h2>

            {item.growth && (
              <p className="flex items-center gap-1 text-xs sm:text-sm font-medium text-green-600">
                <TrendingUp className="w-4 h-4" />
                {item.growth}
              </p>
            )}
          </div>

          {/* ICON */}
          <div
            className={`
            w-10 h-10
            sm:w-11 sm:h-11
            md:w-12 md:h-12
            rounded-xl
            flex
            items-center
            justify-center
            bg-[#F6FAFC]
            ${item.bg}
          `}
          >
            <item.icon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`}
            />
          </div>
        </div>
      ))}
    </section>
  );
}