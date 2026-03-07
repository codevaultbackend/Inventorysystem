"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { useAuth } from "@/app/context/AuthContext";

import DashboardIcon from "../svgIcons/DashboardIcon";
import BranchOverview from "../svgIcons/BranchOverview";
import Reports from "../svgIcons/Reports";
import SystemSetting from "../svgIcons/SystemSetting";
import UserManagement from "../svgIcons/UserManagement";
import { PiWindowsLogo } from "react-icons/pi";
import { BsBarChartLine } from "react-icons/bs";
import { LuUsers } from "react-icons/lu";
import { AiOutlineLineChart } from "react-icons/ai";

/* ================= TYPES ================= */

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
 
  super_admin: [
    { label: "Dashboard", href: "/super-admin", icon: PiWindowsLogo  },
    { label: "Branch Overview", href: "/super-admin/Branches", icon: BsBarChartLine },
    { label: "User Management", href: "/super-admin/users", icon: LuUsers },
    { label: "Reports & Analytics", href: "/super-admin/reports", icon: AiOutlineLineChart },
    { label: "System Settings", href: "/super-admin/settings", icon: SystemSetting },
  ],

  super_stock_manager: [
    { label: "Dashboard", href: "/stock-manager", icon: DashboardIcon },
    { label: "All Stocks", href: "/stock-manager/all-stocks", icon: BsBarChartLine },
    { label: "Aging", href: "/stock-manager/stock-aging", icon: UserManagement },
    { label: "Reports & Analytics", href: "/stock-manager/report-anylysis", icon: AiOutlineLineChart },
  ],

  sales_manager: [
    { label: "Dashboard", href: "/sales-manager", icon: DashboardIcon },
    { label: "Reports", href: "/sales-manager/reports", icon: AiOutlineLineChart },
  ],

  purchase_manager: [
    { label: "Dashboard", href: "/purchase-manager", icon: DashboardIcon },
    { label: "Reports", href: "/purchase-manager/reports", icon: Reports },
  ],

  finance: [
    { label: "Dashboard", href: "/finance", icon: DashboardIcon },
    { label: "Reports", href: "/finance/reports", icon: Reports },
  ],
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {

  const pathname = usePathname();
  const { collapsed } = useApp();
  const { role, logout } = useAuth();

  const NAV_ITEMS = ROLE_NAV_ITEMS[role || ""] || [];

  /* ================= ACTIVE ROUTE DETECTION ================= */

  const activeHref = useMemo(() => {

    if (!pathname) return "";

    // Sort routes by length (longest first)
    const sortedRoutes = [...NAV_ITEMS].sort(
      (a, b) => b.href.length - a.href.length
    );

    const match = sortedRoutes.find((item) =>
      pathname === item.href || pathname.startsWith(item.href + "/")
    );

    return match?.href || "";

  }, [pathname, NAV_ITEMS]);

  return (
    <>
      {/* ================= MOBILE NAV ROW ================= */}
      <div className="lg:hidden w-full px-1 mt-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">

          {NAV_ITEMS.map((item) => {

            const Icon = item.icon;
            const isActive = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2",
                  "px-4 h-[42px] rounded-xl whitespace-nowrap",
                  "border transition",
                  isActive
                    ? "bg-[#1D4ED8] !text-white lg:border-[#1D4ED8]"
                    : "bg-white text-[#6B7280] border-[#E5E7EB]"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "!text-white" : "!text-[#6B7280]"
                  )}
                />

                <span className="text-[13px] font-[500]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside
        className={cn(
          "hidden lg:block",
          "h-screen sticky overflow-y-auto no-scrollbar top-0",
          "bg-white rounded-[20px]",
          "border border-[#EEF2F6]",
          "shadow-[1px_1px_4px_rgba(0,0,0,0.1)]",
          "mb-4",
          collapsed ? "w-[92px]" : "w-[260px]",
          "max-h-[791px] h-full",
          "transition-[width] duration-200 ease-out"
        )}
      >

        {/* NAV */}
        <nav className="mt-4 px-3">
          <div className="space-y-2">

            {NAV_ITEMS.map((item) => {

              const Icon = item.icon;
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3",
                    "h-[50px] rounded-[14px] px-3",
                    "transition",
                    isActive
                      ? "bg-[#EEF5FF] text-[#1D4ED8]"
                      : "text-[#6B7280] hover:bg-[#F7F9FB] hover:text-[#111827]"
                  )}
                >
                  <span
                    className={cn(
                      "h-10 w-10 rounded-[12px] flex items-center justify-center",
                      isActive ? "bg-white" : "group-hover:bg-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive
                          ? "text-[#1D4ED8]"
                          : "text-[#9CA3AF] group-hover:text-[#111827]"
                      )}
                    />
                  </span>

                  {!collapsed && (
                    <span className="text-[14px] font-[500] whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}

          </div>
        </nav>

        {/* FOOTER */}
        <div className="absolute left-0 right-0 bottom-0 p-3">

          <div className="h-px bg-[#EEF2F6] mb-3" />

          <button
            onClick={logout}
            className="
              w-full flex items-center gap-3
              h-[50px] rounded-[14px] px-3
              text-[#6B7280] hover:bg-[#F7F9FB] hover:text-[#111827]
              transition
            "
          >
            <span className="h-10 w-10 rounded-[12px] flex items-center justify-center">
              <LogOut className="h-5 w-5 text-[#9CA3AF]" />
            </span>

            {!collapsed && (
              <span className="text-[14px] font-[500] whitespace-nowrap">
                Log Out
              </span>
            )}
          </button>

        </div>

      </aside>
    </>
  );
}