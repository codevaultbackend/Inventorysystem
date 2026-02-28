"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/app/context/AuthContext";

/* ===== ROLE TYPE (must match AuthContext roles) ===== */
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

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Topbar role={role as Role} />
    
      <div className="flex">
         <Sidebar role={role as Role} />
        <div className="p-6 w-full">{children}</div>
      </div>
    </div>
  );
}