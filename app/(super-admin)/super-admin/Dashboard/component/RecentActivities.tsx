"use client";

import {
  User,
  Package,
  Settings,
  DollarSign,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

type ActivityItem = {
  title: string;
  description: string;
  time: string;
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
      return {
        icon: User,
        bg: "bg-[#EEF2FF]",
        iconColor: "text-[#4F46E5]",
      };
    case "stock":
      return {
        icon: Package,
        bg: "bg-[#ECFDF5]",
        iconColor: "text-[#16A34A]",
      };
    case "settings":
      return {
        icon: Settings,
        bg: "bg-[#F3E8FF]",
        iconColor: "text-[#9333EA]",
      };
    case "sale":
    case "sales":
      return {
        icon: DollarSign,
        bg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      };
    case "alert":
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

export default function RecentActivities({
  data = [],
  loading = false,
}: Props) {
  return (
    <div className="h-fit rounded-[22px] border border-[#E6EDF5] bg-white p-6 shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-5">
        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
          Recent Activities
        </h3>
        <p className="mt-1 text-[13px] text-[#8A94A6]">
          Latest system activities and updates
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start justify-between rounded-[16px] border border-[#EEF2F7] bg-[#FAFCFE] px-4 py-3.5"
            >
              <div className="flex w-full items-start gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-[#EEF2F7]" />
                <div className="flex-1">
                  <div className="mb-2 h-4 w-36 animate-pulse rounded bg-[#EEF2F7]" />
                  <div className="h-3 w-44 animate-pulse rounded bg-[#EEF2F7]" />
                </div>
              </div>
              <div className="h-3 w-16 animate-pulse rounded bg-[#EEF2F7]" />
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((item, index) => {
            const IconData = getActivityIcon(item.type);
            const Icon = IconData.icon;

            return (
              <div
                key={index}
                className="
                  flex items-start justify-between gap-3 rounded-[16px]
                  border border-[#EEF2F7] bg-[#FAFCFE]
                  px-4 py-3.5 transition hover:bg-[#F5F8FC]
                "
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${IconData.bg}`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${IconData.iconColor}`} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#111827]">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#6B7280]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 whitespace-nowrap text-[12px] font-medium text-[#9AA4B2]">
                  {formatRelativeTime(item.time)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex h-[240px] items-center justify-center rounded-[16px] border border-dashed border-[#E5EAF1] bg-[#FAFCFE] text-sm text-[#8A94A6]">
            No recent activities found
          </div>
        )}
      </div>
    </div>
  );
}