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
    <section className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-[768px]:gap-[16px]">
      {stats.map((item, index) => (
        <div
          key={index}
          className="
            bg-white
            rounded-2xl
            border border-gray-100
            shadow-[0_8px_30px_rgba(0,0,0,0.04)]
            px-6 py-5 max-[768px]:px-3
            flex items-center justify-between
            max-[768px]:flex-col-reverse max-[768px]:items-baseline
          "
        >
          <div className="flex gap-2 lg:flex-col">
            <div>
              <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                {item.title}
              </p>

              <h2 className="mt-2 text-3xl font-semibold text-gray-900 tracking-tight">
                {loading ? "..." : formatNumber(item.value)}
              </h2>
            </div>

            {item.growth && (
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-600">
                <TrendingUp className="w-4 h-4" />
                {item.growth}
              </p>
            )}
          </div>

          <div
            className={`w-13 h-13 rounded-xl flex items-center justify-center bg-[#F6FAFC] ${item.bg}`}
          >
            <item.icon className={`w-6 h-6 ${item.iconColor}`} />
          </div>
        </div>
      ))}
    </section>
  );
}
