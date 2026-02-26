"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { useAuth } from "@/app/context/AuthContext";

import DashboardIcon from "../svgIcons/DashboardIcon";
import BranchOverview from "../svgIcons/BranchOverview";
import Reports from "../svgIcons/Reports";
import SystemSetting from "../svgIcons/SystemSetting";
import UserManagement from "../svgIcons/UserManagement";

/* ================= TYPES ================= */

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};


const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
  super_admin: [
    { label: "Dashboard", href: "/super-admin", icon: DashboardIcon },
    { label: "Branch Overview", href: "/super-admin/Branches", icon: BranchOverview },
    { label: "User Management", href: "/super-admin/users", icon: UserManagement },
    { label: "Reports & Analytics", href: "/super-admin/reports", icon: Reports },
    { label: "System Settings", href: "/super-admin/settings", icon: SystemSetting },
  ],

  super_stock_manager: [
    { label: "Dashboard", href: "/stock-manager", icon: DashboardIcon },
    { label: "Stock Overview", href: "/stock-manager/stock", icon: BranchOverview },
    { label: "User Management", href: "/stock-manager/users", icon: UserManagement },
    { label: "Reports", href: "/stock-manager/reports", icon: Reports },
  ],

  sales_manager: [
    { label: "Dashboard", href: "/sales-manager", icon: DashboardIcon },
    { label: "Reports", href: "/sales-manager/reports", icon: Reports },
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
  const router = useRouter();
  const { collapsed } = useApp();
  const { role, logout } = useAuth();

  const NAV_ITEMS = ROLE_NAV_ITEMS[role || ""] || [];

  const activeHref = useMemo(() => {
    const exact = NAV_ITEMS.find((i) => i.href === pathname)?.href;
    if (exact) return exact;

    const parent = NAV_ITEMS.find(
      (i) => pathname?.startsWith(i.href + "/") || pathname === i.href
    )?.href;

    return parent || "";
  }, [pathname, NAV_ITEMS]);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={cn(
        "h-screen sticky overflow-y-auto no-scrollbar top-0",
        "bg-white rounded-[16px]",
        "border border-[#EEF2F6]",
        "shadow-[0px_10px_30px_rgba(17,24,39,0.05)]",
        "my-4",
        collapsed ? "w-[92px]" : "w-[260px]",
        "max-h-[791px]",
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
                    isActive ? "bg-white" : "bg-transparent group-hover:bg-white"
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
          type="button"
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3",
            "h-[50px] rounded-[14px] px-3",
            "text-[#6B7280] hover:bg-[#F7F9FB] hover:text-[#111827]",
            "transition"
          )}
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
  );
}