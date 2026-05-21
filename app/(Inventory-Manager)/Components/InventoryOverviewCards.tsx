"use client";

import { Package, IndianRupee, Boxes, ArrowDownUp } from "lucide-react";
import StockCount from "./StockCounts";

type Props = {
  summary?: {
    totalStockValue?: number | string;
    currentStock?: number | string;
    totalItems?: number | string;
    stockIn?: number | string;
    stockOut?: number | string;
  };
};

export default function InventoryOverviewCards({ summary }: Props) {
  const cards = [
    {
      title: "Current Stock",
      value: Number(summary?.currentStock || 0),
      icon: Package,
      trend: "up" as const,
      iconBgColor: "#E8F1FF",
    },
    {
      title: "Total Stock Value",
      value: Number(summary?.totalStockValue || 0),
      icon: IndianRupee,
      trend: "up" as const,
      iconBgColor: "#EEFBF3",
    },
    {
      title: "Total Items",
      value: Number(summary?.totalItems || 0),
      icon: Boxes,
      trend: "up" as const,
      iconBgColor: "#FFF7E8",
    },
    {
      title: "Stock Movement",
      value: Number(summary?.stockIn || 0) + Number(summary?.stockOut || 0),
      icon: ArrowDownUp,
      trend: "up" as const,
      iconBgColor: "#FDECEC",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-[16px]">
      {cards.map((card) => (
        <StockCount
          key={card.title}
          title={card.title}
          value={card.value}
          trend={card.trend}
          icon={card.icon}
          iconBgColor={card.iconBgColor}
        />
      ))}
    </div>
  );
}