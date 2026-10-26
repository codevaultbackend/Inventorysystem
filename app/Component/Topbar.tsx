"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

import ToggleNav from "../svgIcons/ToggleNav";
import GlobalNotificationCenter from "../(super-admin)/component/DashboardNotificationToast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "";

type ProfileType = {
  name?: string;
  role?: string;
  profile_image?: string;
};

type NotificationType = {
  is_read?: boolean;
};

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

async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
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
  return apiRequest<{ data: ProfileType }>("/profile/get-profile", {
    method: "GET",
  });
}

export default function TopBar() {
  const {
    setCollapsed,
    setMobileOpen,
    globalSearch,
    setGlobalSearch,
  } = useApp();

  const { user } = useAuth();

  const pathname = usePathname();

  const [notificationCount, setNotificationCount] = useState<number>(0);

  const [profile, setProfile] = useState<ProfileType | null>(null);

  const normalizedRole = useMemo(() => {
    return String(profile?.role || user?.role || "")
      .toLowerCase()
      .trim();
  }, [profile?.role, user?.role]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfileApi();

      setProfile(res?.data || null);
    } catch (error) {
      console.error("TOPBAR PROFILE FETCH ERROR:", error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiRequest<{ data: NotificationType[] }>(
        "/sql/notifications"
      );

      const unreadCount =
        res?.data?.filter((item) => !item?.is_read)?.length || 0;

      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("NOTIFICATION FETCH ERROR:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (normalizedRole === "inventory-manager") {
      fetchNotifications();

      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [normalizedRole, fetchNotifications]);

  const handleToggle = () => {
    if (typeof window === "undefined") return;

    if (window.innerWidth < 1140) {
      setMobileOpen(true);
    } else {
      setCollapsed((prev: boolean) => !prev);
    }
  };

  const displayName = profile?.name || user?.name || "User";

  const displayRole = profile?.role || user?.role || "Role";

  const displayImage =
    profile?.profile_image ||
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

  const roleLabel = useMemo(() => {
    return String(displayRole || "Role").replaceAll("_", " ");
  }, [displayRole]);

  const canShowNotifications =
    normalizedRole === "super_admin" &&
    (pathname === "/super-admin" ||
      pathname.startsWith("/super-admin/"));

  return (
    <header
      className="
        relative z-[50]
        flex h-[64px] w-full items-center justify-between
        rounded-[20px] border border-[#EAECF0]
        bg-white
        px-4 sm:px-5 lg:px-6
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)]
      "
    >
      {/* LEFT SECTION */}
      <div className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
        {/* MOBILE TOGGLE */}
        <button
          type="button"
          onClick={handleToggle}
          className="
            flex h-9 w-9 items-center justify-center rounded-[10px]
            transition hover:bg-[#F8FAFC]
            lg:hidden
          "
          aria-label="Toggle navigation"
        >
          <ToggleNav className="h-5 w-5 text-[#111827]" />
        </button>

        {/* COMPANY NAME */}
        <h1
          className="
            truncate whitespace-nowrap
            text-[16px] font-[600] leading-none text-[#0A58A6]
            sm:text-[18px]
            lg:text-[20px]
          "
        >
          Athratech Pvt Limited
        </h1>

        {/* DESKTOP TOGGLE */}
        <button
          type="button"
          onClick={handleToggle}
          className="
            hidden h-9 w-9 items-center justify-center rounded-[10px]
            transition hover:bg-[#F8FAFC]
            lg:flex
          "
          aria-label="Toggle navigation"
        >
          <ToggleNav className="h-5 w-5 text-[#111827]" />
        </button>
      </div>

      {/* SEARCH */}
      <div className="hidden min-w-0 flex-1 px-4 lg:flex xl:px-6">
        <div
          className="
            flex h-[42px] w-full items-center gap-3
            rounded-[12px]
            border border-[#E5E7EB]
            bg-[#F9FAFB]
            px-4
            transition
            focus-within:border-[#0A58A6]
            focus-within:bg-white
          "
        >
          <Search
            size={18}
            className="shrink-0 text-[#9CA3AF]"
          />

          <input
            type="text"
            placeholder="Search anything..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="
              w-full bg-transparent
              text-[14px] font-medium text-[#111827]
              outline-none
              placeholder:text-[#9CA3AF]
            "
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
        {/* INVENTORY MANAGER NOTIFICATION */}
        {normalizedRole === "inventory-manager" && (
          <Link
            href="/inventory-manager/notifications"
            className="
              relative flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-transparent
              transition-all duration-200
              hover:border-[#EAECF0]
              hover:bg-[#F8FAFC]
            "
          >
            <Bell
              size={20}
              className="text-[#475467]"
            />

            {notificationCount > 0 && (
              <span
                className="
                  absolute -right-1 -top-1
                  flex h-5 min-w-[20px]
                  items-center justify-center
                  rounded-full bg-red-500
                  px-1
                  text-[10px] font-semibold text-white
                  shadow-md
                "
              >
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </Link>
        )}

        {/* SUPER ADMIN NOTIFICATIONS */}
        {canShowNotifications && (
          <div className="flex shrink-0 items-center justify-center">
            <GlobalNotificationCenter defaultOpenUrl="/super-admin/dashboard" />
          </div>
        )}

        {/* PROFILE */}
        <Link
          href="/profile"
          className="min-w-0"
        >
          <div
            className="
              flex min-w-0 cursor-pointer items-center gap-2.5
              rounded-[14px]
              border border-transparent
              px-1 py-1
              transition-all duration-200
              hover:border-[#EAECF0]
              hover:bg-[#F9FAFB]
              sm:gap-3
            "
          >
            <Image
              src={displayImage}
              alt="profile"
              width={40}
              height={40}
              unoptimized
              priority
              className="
                h-[38px] w-[38px]
                rounded-full
                border border-[#EAECF0]
                object-cover
                shadow-sm
                sm:h-[40px] sm:w-[40px]
              "
            />

            <div className="hidden min-w-0 leading-tight md:block">
              <p
                className="
                  truncate
                  text-[15px] font-[600]
                  leading-[1.1]
                  text-[#111827]
                  lg:text-[16px]
                "
              >
                {displayName}
              </p>

              <div
                className="
                  mt-1 inline-flex max-w-full items-center
                  rounded-full
                  bg-[#F2F4F7]
                  px-[10px] py-[4px]
                  text-[11px] font-[500]
                  capitalize leading-none
                  text-[#344054]
                "
              >
                <span className="truncate">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}