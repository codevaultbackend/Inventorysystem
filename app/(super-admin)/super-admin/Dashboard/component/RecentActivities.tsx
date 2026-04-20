"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Package,
  Settings,
  DollarSign,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

type ActivityItem = {
  id?: string | number;
  title?: string;
  description?: string;
  message?: string;
  time?: string;
  createdAt?: string;
  created_at?: string;
  type?: string;
};

type Props = {
  data?: ActivityItem[];
  loading?: boolean;
};

function getActivityIcon(type?: string): {
  icon: LucideIcon;
  bg: string;
  iconColor: string;
} {
  switch ((type || "").toLowerCase()) {
    case "user":
    case "login":
    case "signup":
      return {
        icon: User,
        bg: "bg-[#EEF2FF]",
        iconColor: "text-[#4F46E5]",
      };

    case "stock":
    case "inventory":
    case "product":
      return {
        icon: Package,
        bg: "bg-[#ECFDF5]",
        iconColor: "text-[#16A34A]",
      };

    case "settings":
    case "setting":
    case "config":
      return {
        icon: Settings,
        bg: "bg-[#F3E8FF]",
        iconColor: "text-[#9333EA]",
      };

    case "sale":
    case "sales":
    case "payment":
    case "transaction":
      return {
        icon: DollarSign,
        bg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      };

    case "alert":
    case "warning":
    case "error":
      return {
        icon: AlertTriangle,
        bg: "bg-[#FEE2E2]",
        iconColor: "text-[#DC2626]",
      };

    default:
      return {
        icon: Package,
        bg: "bg-[#ECFDF5]",
        iconColor: "text-[#16A34A]",
      };
  }
}

function formatRelativeTime(dateString: string) {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function normalizeActivities(payload: any): ActivityItem[] {
  const raw =
    (Array.isArray(payload) && payload) ||
    payload?.data ||
    payload?.activities ||
    payload?.recentActivities ||
    payload?.result ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item: any, index: number) => ({
    id: item?.id ?? index,
    title: item?.title || item?.action || item?.name || "Activity",
    description:
      item?.description ||
      item?.message ||
      item?.details ||
      "Latest system activity and updates",
    time:
      item?.time ||
      item?.createdAt ||
      item?.created_at ||
      item?.updatedAt ||
      item?.updated_at ||
      "",
    type: item?.type || item?.category || "",
  }));
}

export default function RecentActivities({
  data,
  loading = false,
}: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState("");

  const hasExternalData = Array.isArray(data);

  useEffect(() => {
    if (hasExternalData) return;

    const fetchActivities = async () => {
      try {
        setApiLoading(true);
        setError("");

        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "https://ims-swp9.onrender.com";

        const token =
          (typeof window !== "undefined" &&
            (localStorage.getItem("accessToken") ||
              localStorage.getItem("token") ||
              localStorage.getItem("authToken") ||
              localStorage.getItem("ims_token") ||
              localStorage.getItem("imsToken") ||
              localStorage.getItem("jwt"))) ||
          "";

        const res = await fetch(`${API_BASE}/sql/recent-activities`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            json?.message || json?.error || "Failed to fetch recent activities"
          );
        }

        setActivities(normalizeActivities(json));
      } catch (err: any) {
        setError(err?.message || "Failed to fetch recent activities");
        setActivities([]);
      } finally {
        setApiLoading(false);
      }
    };

    fetchActivities();
  }, [hasExternalData]);

  const finalLoading = loading || apiLoading;

  const finalData = useMemo(() => {
    if (hasExternalData) {
      return normalizeActivities(data);
    }
    return activities;
  }, [hasExternalData, data, activities]);

  return (
    <section
      className="
        h-full min-h-[380px] rounded-[20px] border border-[#E7EDF4] bg-white
        px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.10)]
        sm:px-5 sm:py-5
        xl:min-h-[414px]
      "
    >
      <div className="mb-4 border-b border-[#EDF2F7] pb-4">
        <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#171717]">
          Recent Activities
        </h3>
        <p className="mt-1 text-[13px] leading-[18px] text-[#9AA0AA]">
          Latest system activities and updates
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {finalLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="
                flex items-start justify-between gap-3 rounded-[14px]
                border border-[#EEF2F7] bg-[#F8FBFF]
                px-4 py-3.5
              "
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-[10px] bg-[#EEF2F7]" />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#EEF2F7]" />
                  <div className="h-3 w-44 max-w-full animate-pulse rounded bg-[#EEF2F7]" />
                </div>
              </div>
              <div className="mt-1 h-3 w-14 shrink-0 animate-pulse rounded bg-[#EEF2F7]" />
            </div>
          ))
        ) : error ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[16px] border border-dashed border-[#E5EAF1] bg-[#FAFCFE] px-4 text-center text-sm text-[#8A94A6]">
            {error}
          </div>
        ) : finalData.length > 0 ? (
          finalData.slice(0, 5).map((item, index) => {
            const IconData = getActivityIcon(item.type);
            const Icon = IconData.icon;

            return (
              <article
                key={item.id ?? index}
                className="
                  flex items-start justify-between gap-3 rounded-[14px]
                  border border-[#EEF2F7] bg-[#F8FBFF]
                  px-4 py-3.5 transition-colors duration-200
                  hover:bg-[#F4F8FC]
                "
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${IconData.bg}`}
                  >
                    <Icon className={`h-[18px] w-[18px] ${IconData.iconColor}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium leading-[20px] text-[#2B2B2B]">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-[18px] text-[#9AA0AA]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 whitespace-nowrap pt-1 text-[12px] font-medium text-[#A1A1AA]">
                  {formatRelativeTime(item.time || "")}
                </span>
              </article>
            );
          })
        ) : (
          <div className="flex min-h-[260px] items-center justify-center rounded-[16px] border border-dashed border-[#E5EAF1] bg-[#FAFCFE] px-4 text-center text-sm text-[#8A94A6]">
            No recent activities found
          </div>
        )}
      </div>
    </section>
  );
}