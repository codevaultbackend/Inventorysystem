"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/app/context/AuthContext";

/* ===== ROLE TYPE ===== */
export type Role =
  | "super_admin"
  | "admin"
  | "hr_admin"
  | "super_stock_manager"
  | "stock_manager"
  | "sales_manager"
  | "purchase_manager"
  | "finance";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 font-semibold">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="md:min-h-screen lg:min-h-screen bg-[#F7F9FB]">

      {/* TOPBAR */}
      <div className="px-4 lg:px-6 py-4">
        <Topbar role={role as Role} />
      </div>

      {/* SIDEBAR + CONTENT */}
      <div className="lg:flex gap-6 px-4 lg:px-6 pb-6">

        {/* Sidebar (handles mobile + desktop internally) */}
        <Sidebar role={role as Role} />

        {/* Page Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}