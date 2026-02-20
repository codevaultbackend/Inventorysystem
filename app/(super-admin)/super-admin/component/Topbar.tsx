"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import ToggleNav from "../../../svgIcons/ToggleNav";
import Link from "next/link";

export default function TopBar() {
  const { collapsed, setCollapsed, setMobileOpen } = useApp();

  return (
    <header
      className="
        w-full
        min-h-[72px]
        bg-white
        max-[1140px]:bg-transparent
        max-[1140px]:shadow-[0]
        rounded-2xl
        px-0 lg:px-6
        py-3 lg:py-0
        flex flex-col lg:flex-row
        items-center justify-between
        gap-3 lg:gap-0
        shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      "
    >
      {/* ================= LEFT (Logo + Toggle) ================= */}
      <div className="flex items-center justify-between w-full lg:w-auto">

        <span className="text-[16px] font-[500] text-[#0A58A6] whitespace-nowrap">
          Athratech Pvt Limited
        </span>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => {
            // mobile → open drawer
            if (window.innerWidth < 1024) {
              setMobileOpen(true);
            } else {
              // desktop collapse
              setCollapsed((p) => !p);
            }
          }}
          className="
            ml-3
            h-9 w-9
            rounded-lg
            border border-[#EEF2F6]
            bg-white hover:bg-[#F7F9FB]
            flex items-center justify-center
            transition
            lg:hidden
            max-[1140px]:hidden
          "
        >
          <ToggleNav className="h-5 w-5 text-[#6B7280]" />
        </button>


        <div className="flex items-center gap-3 min-[1140px]:hidden">
          <Image
            src="https://i.pravatar.cc/40?img=3"
            alt="profile"
            width={36}
            height={36}
            className="rounded-full"
          /> </div>
      </div>

      {/* ================= CENTER (Search) ================= */}
      <div className="w-full lg:flex-1 lg:max-w-[827px] lg:px-6">
        <div
          className="
            h-[48px]
            bg-[#F8FAFC]
            max-[1140px]:bg-[#FFFFFF]
            rounded-xl
            flex items-center
            px-4
            gap-2
            w-full
          "
        >
          <Search size={18} className="text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search"
            className="
              w-full bg-transparent
              outline-none
              text-[14px]
              text-[#0F172A]
              placeholder:text-[#94A3B8]
            "
          />
        </div>
      </div>

      {/* ================= RIGHT (Profile) ================= */}
      <div className="flex items-center gap-3 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end">
        <Link href='/super-admin/Profile' >
          <div className="flex items-center gap-3 max-[1140px]:hidden">
            <Image
              src="https://i.pravatar.cc/40?img=3"
              alt="profile"
              width={36}
              height={36}
              className="rounded-full"
            />

            {/* Hide text on very small screens */}
            <div className="leading-tight hidden sm:block">
              <p className="text-[14px] font-medium text-[#0F172A]">
                Gustavo Xavier
              </p>
              <p className="text-[10px] bg-[#F2F8FF] text-center text-[#131313] leading-[16px] rounded-full px-2 py-[2px] mt-1">
                Super Admin
              </p>
            </div>
          </div></Link>

      </div>
    </header>
  );
}
