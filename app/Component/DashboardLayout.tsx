"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
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
      <div className="sticky !bg-[#F6F8FA] top-0 z-50 px-4 pt-[16px] lg:px-6">
        <Topbar />
      </div>

      <div className="flex gap-[16px] px-4 pb-6 pt-4 lg:px-6">
        <Sidebar role={role} />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}