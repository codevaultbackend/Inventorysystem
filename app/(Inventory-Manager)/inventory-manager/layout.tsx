"use client";

import React from "react";
import DashboardLayout, {
  Role,
} from "../../Component/DashboardLayout";

import { SuperStockAdminProvider } from "@/app/context/SuperStockAdminContext";
import { LocationsProvider } from "@/app/context/LocationsContext";
import { StateLocationProvider } from "@/app/context/StateLocation";
import { StockProvider } from "@/app/context/StockContext";
import { InventoryManagerDashboard } from "@/app/context/InventoryManagerDashboard";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  const role: Role = "super_stock_manager";

  return (
    <InventoryManagerDashboard>
      <StockProvider>
        <StateLocationProvider>


          <DashboardLayout role={role}>
            {children}
          </DashboardLayout>


        </StateLocationProvider></StockProvider> </InventoryManagerDashboard>

  );
}