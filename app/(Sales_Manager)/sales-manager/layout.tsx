"use client";

import React, { useMemo } from "react";
import DashboardLayout, { Role } from "../../Component/DashboardLayout";
import { SuperStockAdminProvider } from "@/app/context/SuperStockAdminContext";
import { LocationsProvider } from "@/app/context/LocationsContext";
import { StateLocationProvider } from "@/app/context/StateLocation";
import { StockProvider } from "@/app/context/StockContext";
import { useAuth } from "@/app/context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

function resolveDashboardRole(authRole?: string | null): Role {
  const normalized = String(authRole || "").toLowerCase().trim();

  if (normalized === "super_sales_manager") return "super_sales_manager" as Role;
  if (normalized === "sales_manager") return "sales_manager" as Role;
  if (normalized === "super_stock_manager") return "super_stock_manager" as Role;
  if (normalized === "stock_manager") return "stock_manager" as Role;
  if (normalized === "super_inventory_manager") return "super_inventory_manager" as Role;
  if (normalized === "inventory_manager") return "inventory_manager" as Role;
  if (normalized === "admin") return "admin" as Role;
  if (normalized === "super_admin") return "super_admin" as Role;

  return "super_sales_manager" as Role;
}

export default function Layout({ children }: LayoutProps) {
  const auth = useAuth?.();
  const role = useMemo(
    () => resolveDashboardRole(auth?.role),
    [auth?.role]
  );

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
      </StateLocationProvider>
    </StockProvider>
  );
}