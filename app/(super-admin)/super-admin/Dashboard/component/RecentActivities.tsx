"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Package,
  Settings,
  DollarSign,
  AlertTriangle,
  LucideIcon,
  KeyRound,
  Shield,
  CheckCircle2,
} from "lucide-react";

type ActivityItem = {
  id?: string | number;
  title?: string;
  description?: string;
  message?: string;
  time?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  type?: string;
  action?: string;
  details?: string;
  ref_type?: string;
  category?: string;
  name?: string;
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
  const value = (type || "").toLowerCase();

  if (
    value.includes("password_reset") ||
    value.includes("otp") ||
    value.includes("reset")
  ) {
    return {
      icon: KeyRound,
      bg: "bg-[#F3E8FF]",
      iconColor: "text-[#9333EA]",
    };
  }

  if (
    value.includes("security") ||
    value.includes("access") ||
    value.includes("login")
  ) {
    return {
      icon: Shield,
      bg: "bg-[#EEF2FF]",
      iconColor: "text-[#4F46E5]",
    };
  }

  if (
    value.includes("user") ||
    value.includes("signup") ||
    value.includes("register")
  ) {
    return {
      icon: User,
      bg: "bg-[#EEF2FF]",
      iconColor: "text-[#4F46E5]",
    };
  }

  if (
    value.includes("stock") ||
    value.includes("inventory") ||
    value.includes("product")
  ) {
    return {
      icon: Package,
      bg: "bg-[#ECFDF5]",
      iconColor: "text-[#16A34A]",
    };
  }

  if (
    value.includes("settings") ||
    value.includes("setting") ||
    value.includes("config")
  ) {
    return {
      icon: Settings,
      bg: "bg-[#F3E8FF]",
      iconColor: "text-[#9333EA]",
    };
  }

  if (
    value.includes("sale") ||
    value.includes("sales") ||
    value.includes("payment") ||
    value.includes("transaction")
  ) {
    return {
      icon: DollarSign,
      bg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    };
  }

  if (
    value.includes("success") ||
    value.includes("completed") ||
    value.includes("approved")
  ) {
    return {
      icon: CheckCircle2,
      bg: "bg-[#ECFDF5]",
      iconColor: "text-[#16A34A]",
    };
  }

  if (
    value.includes("alert") ||
    value.includes("warning") ||
    value.includes("error") ||
    value.includes("reject")
  ) {
    return {
      icon: AlertTriangle,
      bg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
    };
  }

  return {
    icon: Package,
    bg: "bg-[#ECFDF5]",
    iconColor: "text-[#16A34A]",
  };
}

function formatRelativeTime(dateString: string) {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "Recently";

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveType(item: any) {
  const action = String(item?.action || "").toLowerCase();
  const refType = String(item?.ref_type || "").toLowerCase();
  const type = String(item?.type || "").toLowerCase();
  const category = String(item?.category || "").toLowerCase();

  if (type) return type;
  if (category) return category;

  if (refType.includes("password_reset")) return "password_reset";

  if (
    action.includes("password") ||
    action.includes("reset") ||
    action.includes("otp")
  ) {
    return "password_reset";
  }

  if (action.includes("login") || action.includes("access")) {
    return "security";
  }

  if (
    action.includes("sale") ||
    action.includes("transaction") ||
    action.includes("payment")
  ) {
    return "sales";
  }

  if (
    action.includes("stock") ||
    action.includes("inventory") ||
    action.includes("product")
  ) {
    return "inventory";
  }

  if (
    action.includes("success") ||
    action.includes("completed") ||
    action.includes("approved")
  ) {
    return "success";
  }

  if (
    action.includes("warning") ||
    action.includes("error") ||
    action.includes("reject")
  ) {
    return "warning";
  }

  return item?.action || item?.ref_type || "";
}

function deriveTitle(item: any) {
  if (item?.title && String(item.title).trim()) return String(item.title).trim();

  if (item?.action && String(item.action).trim()) {
    return toTitleCase(String(item.action).trim());
  }

  if (item?.name && String(item.name).trim()) return String(item.name).trim();

  return "Activity";
}

function deriveDescription(item: any) {
  if (item?.description && String(item.description).trim()) {
    return String(item.description).trim();
  }

  if (item?.message && String(item.message).trim()) {
    return String(item.message).trim();
  }

  if (item?.details && String(item.details).trim()) {
    return String(item.details).trim();
  }

  return "Latest system activity and updates";
}

function normalizeActivities(payload: any): ActivityItem[] {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.activities)
    ? payload.activities
    : Array.isArray(payload?.recentActivities)
    ? payload.recentActivities
    : Array.isArray(payload?.result)
    ? payload.result
    : [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item: any, index: number) => ({
    id: item?.id ?? index,
    title: deriveTitle(item),
    description: deriveDescription(item),
    time:
      item?.time ||
      item?.createdAt ||
      item?.created_at ||
      item?.updatedAt ||
      item?.updated_at ||
      "",
    createdAt: item?.createdAt || item?.created_at || "",
    created_at: item?.created_at || "",
    updatedAt: item?.updatedAt || item?.updated_at || "",
    updated_at: item?.updated_at || "",
    type: deriveType(item),
    action: item?.action || "",
    details: item?.details || "",
    ref_type: item?.ref_type || "",
  }));
}

export default function RecentActivities({
  data,
  loading = false,
}: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState("");

  const hasUsableExternalData = Array.isArray(data) && data.length > 0;

  useEffect(() => {
    if (hasUsableExternalData) return;

    let isMounted = true;

    const fetchActivities = async () => {
      try {
        setApiLoading(true);
        setError("");

        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "https://ims-backend-nm9g.onrender.com";

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
          cache: "no-store",
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok) {
          throw new Error(
            json?.message || json?.error || "Failed to fetch recent activities"
          );
        }

        if (!isMounted) return;

        setActivities(normalizeActivities(json));
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to fetch recent activities");
        setActivities([]);
      } finally {
        if (isMounted) {
          setApiLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [hasUsableExternalData]);

  const finalLoading = loading || apiLoading;

  const finalData = useMemo(() => {
    if (hasUsableExternalData) {
      return normalizeActivities(data);
    }
    return activities;
  }, [hasUsableExternalData, data, activities]);

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