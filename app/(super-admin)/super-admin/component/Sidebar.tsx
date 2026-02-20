"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  GitBranch,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import DashboardIcon from '../../../svgIcons/DashboardIcon'
import BranchOverview from '../../../svgIcons/BranchOverview'
import Reports from '../../../svgIcons/Reports'
import SystemSetting from '../../../svgIcons/SystemSetting'
import UserManagement from '../../../svgIcons/UserManagement'
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/super-admin", icon: DashboardIcon },
  { label: "Branch Overview", href: "/super-admin/Branches", icon: BranchOverview },
  { label: "User Management", href: "/super-admin/users", icon: UserManagement },
  { label: "Reports & Analytics", href: "/super-admin/reports", icon: Reports },
  { label: "System Settings", href: "/super-admin/settings", icon: SystemSetting },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useApp()
  const router = useRouter();

  const handleLogout = () => {

    localStorage.clear();

    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";

    router.replace("/Login");
  };


  const activeHref = useMemo(() => {
    // marks parent routes active as well
    const exact = NAV_ITEMS.find((i) => i.href === pathname)?.href;
    if (exact) return exact;

    const parent = NAV_ITEMS.find(
      (i) => pathname?.startsWith(i.href + "/") || pathname === i.href
    )?.href;

    return parent || "";
  }, [pathname]);

  return (
    <aside
      className={cn(
        "h-screen  sticky overflow-y-auto no-scrollbar top-0  max-[1140px]:top-[20px]  max-[1140px]:h-fit max-[1140px]:h-fit max-[1140px]:overflow-scroll max-[1140px]:flex max-[1140px]:w-full  max-[1140px]:z-[99999] ",
        "bg-white max-[1140px]:bg-transparent rounded-[16px]",
        "border border-[#EEF2F6] max-[1140px]:border-0",
        "shadow-[0px_10px_30px_rgba(17,24,39,0.05)] max-[1140px]:!shadow-[0]",
        " my-4 max-[1140px]:mt-0",
        collapsed ? "w-[92px]" : "w-[260px]",
        "max-h-[791px]",
        "transition-[width] duration-200 ease-out"
      )}
    >


      {/* Nav */}
      <nav className="mt-4 px-3 max-[1140px]:px-0 max-[1140px]:mt-0">
        <div className="space-y-2 max-[1140px]:!space-y-0 max-[1140px]:space-y-0 max-[1140px]:flex max-[1140px]:!gap-2 max-[1140px]:flex ">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 max-[1140px]:!max-w-fit max-[1140px]:!shadow-[0px_1px_6px_0px_#bcbcbc] max-[1140px]:!my-[5px]",
                  "h-[50px] rounded-[14px] px-3",
                  "transition",
                  isActive
                    ? "bg-[#EEF5FF] text-[#1D4ED8] max-[1140px]:bg-[#0D4CBA] max-[1140px]:text-[#fff]"
                    : "text-[#6B7280] max-[1140px]:bg-[#FFFFFF] hover:bg-[#F7F9FB] hover:text-[#111827]"
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
                  <span
                    className="
    text-[14px]
    font-[500]
    whitespace-nowrap
    max-[1140px]:!max-w-fit
  "
                  >
                    {item.label}
                  </span>

                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="absolute max-[1140px]:static left-0 right-0 bottom-0 p-3 max-[1140px]:p-0">
        <div className="h-px bg-[#EEF2F6] mb-3 max-[1140px]:hidden" />

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3",
            "h-[50px] rounded-[14px] px-3",
            "text-[#6B7280] max-[1140px]:bg-red-600 max-[1140px]:text-[#fff] hover:bg-[#F7F9FB] hover:text-[#111827] max-[768px]:ml-[10px] max-[768px]:mt-[4px]",
            "transition"
          )}
        >
          <span className="h-10 w-10 rounded-[12px] flex items-center justify-center">
            <LogOut className="h-5 w-5 text-[#9CA3AF]" />
          </span>
          {!collapsed && <span className="text-[14px] font-[500] whitespace-nowrap ">Log Out</span>}
        </button>
      </div>
    </aside >
  );
}
