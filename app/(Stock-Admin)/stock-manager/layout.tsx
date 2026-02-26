"use client";

import DashboardLayout from "../../Component/DashboardLayout";
import { SuperStockAdminProvider } from "@/app/context/SuperStockAdminContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperStockAdminProvider>
      <DashboardLayout role="super_stock_manager">
        {children}
      </DashboardLayout>
    </SuperStockAdminProvider>
  );
}