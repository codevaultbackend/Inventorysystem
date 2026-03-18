"use client";

import React from "react";
import DashboardLayout, {
  Role,
} from "../../Component/DashboardLayout";

import { SuperStockAdminProvider } from "@/app/context/SuperStockAdminContext";
import { LocationsProvider } from "@/app/context/LocationsContext";
import { StateLocationProvider } from "@/app/context/StateLocation";
import { StockProvider } from "@/app/context/StockContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  const role: Role = "super_stock_manager";

  return (
 <StockProvider>
    <StateLocationProvider>
      <LocationsProvider>

        <SuperStockAdminProvider>

          <DashboardLayout role={role}>
            {children}
          </DashboardLayout>

        </SuperStockAdminProvider>

      </LocationsProvider>
    </StateLocationProvider></StockProvider>

  );
}