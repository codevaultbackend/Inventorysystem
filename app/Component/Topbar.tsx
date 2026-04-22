"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import ToggleNav from "../svgIcons/ToggleNav";
import Link from "next/link";
import GlobalNotificationCenter from "../(super-admin)/component/DashboardNotificationToast";
import { useEffect, useMemo, useState } from "react";
import { FaUserAlt } from "react-icons/fa";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "";

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

async function apiRequest(url, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Something went wrong");
  }

  return data;
}

async function getProfileApi() {
  return apiRequest("/profile/get-profile", {
    method: "GET",
  });
}

export default function TopBar() {
  const { setCollapsed, setMobileOpen, globalSearch, setGlobalSearch } =
    useApp();
  const { user } = useAuth();
  const pathname = usePathname();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();
        if (!isMounted) return;
        setProfile(res?.data || null);
      } catch (error) {
        console.error("TOPBAR PROFILE FETCH ERROR:", error);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = () => {
    if (window.innerWidth < 1140) {
      setMobileOpen(true);
    } else {
      setCollapsed((p) => !p);
    }
  };

  const displayName = profile?.name || user?.name || "User";
  const displayRole = profile?.role || user?.role || "Role";
  const displayImage =
    profile?.profile_image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

  const normalizedRole = String(profile?.role || user?.role || "")
    .toLowerCase()
    .trim();

  const canShowNotifications =
    normalizedRole === "super_admin" &&
    (pathname === "/super-admin" || pathname.startsWith("/super-admin/"));

  const roleLabel = useMemo(() => {
    return String(displayRole || "Role").replaceAll("_", " ");
  }, [displayRole]);

  return (
    <header
      className="
        relative z-[50]
        flex h-[64px] w-full items-center justify-between
        rounded-[20px] bg-white
        px-4 sm:px-5 lg:px-6
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)]
      "
    >
      {/* LEFT */}
      <div className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
        <span
          className="
            truncate whitespace-nowrap text-[16px] font-[500] leading-none text-[#0A58A6]
            sm:text-[18px] lg:text-[20px]
          "
        >
          Athratech Pvt Limited
        </span>

        {/* desktop only toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className="
            hidden h-9 w-9 items-center justify-center rounded-[10px]
            bg-transparent transition hover:bg-[#F8FAFC]
            lg:flex
          "
          aria-label="Toggle navigation"
        >
          <ToggleNav className="h-5 w-5 text-[#111827]" />
        </button>
      </div>

      {/* CENTER SEARCH */}
      <div className="hidden min-w-0 flex-1 px-4 lg:flex xl:px-6">
        <div
          className="
            flex h-[40px] w-full items-center gap-3
            rounded-[10px] border border-[#EEF2F6] bg-[#F8FAFC]
            px-4
          "
        >
          <Search size={18} className="shrink-0 text-[#9CA3AF]" />

          <input
            type="text"
            placeholder="Search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="
              w-full bg-transparent text-[15px] font-normal text-[#111827] outline-none
              placeholder:text-[#A3A3A3]
            "
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="flex shrink-0 items-center justify-center">
          {canShowNotifications ? (
            <GlobalNotificationCenter defaultOpenUrl="/super-admin/dashboard" />
          ) : null}
        </div>

        <Link href="/profile" className="min-w-0 ">
          <div className="flex min-w-0 cursor-pointer items-center gap-2.5 sm:gap-3 ">
            <Image
              src={displayImage}
              alt="profile"
              width={40}
              height={40}
              unoptimized
              className="h-[36px] w-[36px] rounded-full object-cover sm:h-[40px] sm:w-[40px] shadow-sm"
            />

            <div className="hidden min-w-0 leading-tight md:block">
              <p className="truncate text-[15px] font-[500] leading-[1.1] text-[#111827] lg:text-[16px]">
                {displayName}
              </p>

              <p
                className="
                  mt-1 inline-flex max-w-full items-center rounded-full
                  bg-[#F2F4F7] px-[10px] py-[3px]
                  text-[11px] font-[400] capitalize leading-none text-[#344054]
                "
              >
                <span className="truncate">{roleLabel}</span>
              </p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}