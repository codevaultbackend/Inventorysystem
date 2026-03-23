"use client";

import Image from "next/image";
import { Search, Settings } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import ToggleNav from "../svgIcons/ToggleNav";
import Link from "next/link";

export default function TopBar() {
  const { setCollapsed, setMobileOpen } = useApp();
  const { user } = useAuth();

  const handleToggle = () => {
    if (window.innerWidth < 1140) {
      setMobileOpen(true);
    } else {
      setCollapsed((p) => !p);
    }
  };

  return (
    <header
      className="
        relative z-[1]
        flex h-[72px] w-full items-center justify-between
        rounded-[12px] bg-white px-4 shadow-[1px_1px_4px_rgba(0,0,0,0.1)]
        lg:px-6
      "
    >
      <div className="flex items-center gap-4">
        <span className="whitespace-nowrap text-[16px] font-[500] text-[#0A58A6]">
          Athratech Pvt Limited
        </span>

        <button
          onClick={handleToggle}
          className="
            hidden h-10 w-10 items-center justify-center rounded-lg border border-[#E5E7EB]
            bg-white transition hover:bg-[#F3F4F6] lg:flex
          "
        >
          <ToggleNav className="h-5 w-5 text-[#374151]" />
        </button>
      </div>

      <div className="hidden max-w-[720px] flex-1 px-6 lg:flex">
        <div
          className="
            flex h-[44px] w-full items-center gap-2 rounded-xl border border-[#EEF2F6]
            bg-[#F8FAFC] px-4
          "
        >
          <Search size={18} className="text-[#94A3B8]" />

          <input
            type="text"
            placeholder="Search"
            className="
              w-full bg-transparent text-[14px] text-[#0F172A] outline-none
              placeholder:text-[#94A3B8]
            "
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/profile" className="lg:hidden">
          <button
            className="
              flex h-10 w-10 items-center justify-center rounded-lg
              transition hover:bg-[#F3F4F6]
            "
          >
            <Settings size={18} className="text-[#374151]" />
          </button>
        </Link>

        <Link href="/profile">
          <div className="flex cursor-pointer items-center gap-3">
            <Image
              src="https://i.pravatar.cc/40?img=3"
              alt="profile"
              width={36}
              height={36}
              className="rounded-full"
            />

            <div className="hidden leading-tight md:block">
              <p className="text-[14px] font-medium text-[#0F172A]">
                {user?.name || "User"}
              </p>

              <p className="mt-1 rounded-full bg-[#F2F8FF] px-2 py-[2px] text-center text-[10px] capitalize text-[#131313]">
                {user?.role?.replaceAll("_", " ") || "Role"}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}