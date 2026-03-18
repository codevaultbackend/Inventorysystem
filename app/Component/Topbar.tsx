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
      w-full
      h-[72px]
      bg-white
      rounded-[12px]
      px-4 lg:px-6
      flex items-center
      justify-between
      shadow-[1px_1px_4px_rgba(0,0,0,0.1)]
    "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <span className="text-[16px] font-[500] text-[#0A58A6] whitespace-nowrap">
          Athratech Pvt Limited
        </span>

        <button
          onClick={handleToggle}
          className="
            hidden lg:flex
            h-10 w-10
            rounded-lg
            border border-[#E5E7EB]
            items-center justify-center
            bg-white
            hover:bg-[#F3F4F6]
            transition
          "
        >
          <ToggleNav className="h-5 w-5 text-[#374151]" />
        </button>
      </div>

      {/* SEARCH */}
      <div className="hidden lg:flex flex-1 max-w-[720px] px-6">
        <div
          className="
            h-[44px]
            bg-[#F8FAFC]
            rounded-xl
            flex items-center
            px-4
            gap-2
            w-full
            border border-[#EEF2F6]
          "
        >
          <Search size={18} className="text-[#94A3B8]" />

          <input
            type="text"
            placeholder="Search"
            className="
              w-full
              bg-transparent
              outline-none
              text-[14px]
              text-[#0F172A]
              placeholder:text-[#94A3B8]
            "
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* SETTINGS (MOBILE ONLY) */}
        <Link href="/profile" className="lg:hidden">
          <button
            className="
              h-10 w-10
              rounded-lg
              flex items-center justify-center
              hover:bg-[#F3F4F6]
              transition
            "
          >
            <Settings size={18} className="text-[#374151]" />
          </button>
        </Link>

        {/* PROFILE (DESKTOP) */}
        <Link href="/profile">
          <div className="flex items-center gap-3 cursor-pointer">
            <Image
              src="https://i.pravatar.cc/40?img=3"
              alt="profile"
              width={36}
              height={36}
              className="rounded-full"
            />

            <div className="hidden md:block leading-tight">
              <p className="text-[14px] font-medium text-[#0F172A]">
                {user?.name || "User"}
              </p>

              <p className="text-[10px] bg-[#F2F8FF] text-[#131313] rounded-full px-2 py-[2px] text-center mt-1 capitalize">
                {user?.role?.replaceAll("_", " ") || "Role"}
              </p>
            </div>
          </div>
        </Link>

      </div>
    </header>
  );
}