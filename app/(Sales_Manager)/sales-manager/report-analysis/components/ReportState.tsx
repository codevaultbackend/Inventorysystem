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
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Target,
      trend: "",
      trendColor: "text-red-500",
      label: "Avg. Order Value",
      value: formatCurrency(cards.avgOrderValue),
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      icon: ShoppingCart,
      trend: "",
      trendColor: "text-green-600",
      label: "Total Orders",
      value: String(cards.totalOrders),
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Users,
      trend: "",
      trendColor: "text-green-600",
      label: "Active Clients",
      value: String(cards.activeClients),
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
      {stateData.map((state, index) => {
        const Icon = state.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 flex justify-between items-center shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="space-y-1">
              <span className={`text-sm font-semibold ${state.trendColor}`}>
                {state.trend || " "}
              </span>

              <h3 className="text-2xl font-bold text-gray-900 tracking-tight break-words">
                {state.value}
              </h3>

              <p className="text-sm text-gray-500 font-medium">{state.label}</p>
            </div>

            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${state.bg}`}
            >
              <Icon className={`w-6 h-6 ${state.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}