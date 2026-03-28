"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import GlobalSearchNavigator from "./GlobalSearchNavigator";
import { useAuth } from "@/app/context/AuthContext";

export type Role =
  | "super_admin"
  | "admin"
  | "hr_admin"
  | "super_stock_manager"
  | "stock_manager"
  | "sales_manager"
  | "purchase_manager"
  | "super_sales_manager"
  | "finance";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  const role = user?.role as Role | undefined;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center font-semibold text-red-600">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <div className="lg:sticky top-0 z-50 bg-[#F6F8FA] px-4 pt-4 lg:px-6">
        <Topbar />
      </div>

      <GlobalSearchNavigator />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-4 lg:flex-row lg:gap-[16px] lg:px-6">
        <Sidebar role={role} />

        <main
          data-dashboard-search-root="true"
          className="w-full min-w-0 flex-1"
        >
          {children}
        </main>
      </div>
    </div>
  );
}