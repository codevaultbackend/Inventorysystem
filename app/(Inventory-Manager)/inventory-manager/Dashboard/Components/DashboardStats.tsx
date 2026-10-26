"use client";

import { Users, Package, AlertTriangle, TrendingUp } from "lucide-react";
import StockCount from "../../../Components/StockCounts";

export default function DashboardStats({ kpi }: any) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <StockCount title="Total Stock Items" value={kpi.totalStock} icon={Users} iconBgColor="#E8F1FF" />

      <StockCount title="Low Stock Items" value={kpi.lowStock} icon={Package} iconBgColor="#EEF5FF" />

      <StockCount title="Damaged Stock" value={kpi.damagedStock} icon={AlertTriangle} iconBgColor="#FEE2E2" />

      <StockCount title="Repairable Stock" value={kpi.repairableStock} icon={TrendingUp} iconBgColor="#DCFCE7" />
    </div>
  );
}