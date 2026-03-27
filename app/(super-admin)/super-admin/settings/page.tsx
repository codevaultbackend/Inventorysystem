"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  Settings,
  Bell,
  Shield,
  User,
  Package,
  DollarSign,
  AlertTriangle,
  Mail,
  Smartphone,
  KeyRound,
  ListFilter,
} from "lucide-react";

type TabType = "general" | "notification" | "security";

type NotificationItem = {
  id?: string | number;
  title?: string;
  message?: string;
  description?: string;
  time?: string;
  createdAt?: string;
  created_at?: string;
  type?: string;
};

type ActivityItem = {
  id?: string | number;
  title?: string;
  action?: string;
  message?: string;
  description?: string;
  time?: string;
  createdAt?: string;
  created_at?: string;
  type?: string;
};

type CombinedItemType = "notification" | "activity";

type FilterType =
  | "all"
  | "notification"
  | "activity"
  | "user"
  | "inventory"
  | "sales"
  | "alert"
  | "system"
  | "otp";

type CombinedItem = {
  id: string | number;
  icon: React.ReactNode;
  title: string;
  sub: string;
  time: string;
  rawTime?: string;
  kind: CombinedItemType;
  type?: string;
  normalizedCategory:
    | "user"
    | "inventory"
    | "sales"
    | "alert"
    | "system"
    | "otp"
    | "other";
};

const INITIAL_VISIBLE_ITEMS = 8;
const LOAD_MORE_COUNT = 8;
const SCROLL_THRESHOLD = 120;

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const [notificationsError, setNotificationsError] = useState("");
  const [activitiesError, setActivitiesError] = useState("");

  const [notificationFilter, setNotificationFilter] =
    useState<FilterType>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ITEMS);

  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-swp9.onrender.com";

  useEffect(() => {
    if (activeTab === "notification") {
      fetchNotifications();
      fetchRecentActivities();
    }
  }, [activeTab]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_ITEMS);
  }, [notificationFilter, notifications, activities]);

  const getStoredToken = () => {
    if (typeof window === "undefined") return "";

    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("ims_token") ||
      localStorage.getItem("imsToken") ||
      localStorage.getItem("jwt") ||
      ""
    );
  };

  const getHeaders = () => {
    const token = getStoredToken();

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const readResponse = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const extractArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data?.recentActivities)) return data.recentActivities;
    if (Array.isArray(data?.activities)) return data.activities;
    if (Array.isArray(data?.result)) return data.result;
    return [];
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError("");

      const res = await fetch(`${API_BASE}/sql/notifications`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load notifications"
        );
      }

      setNotifications(extractArray(data));
    } catch (error: any) {
      setNotificationsError(
        error?.message || "Failed to load notifications"
      );
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError("");

      const res = await fetch(`${API_BASE}/sql/recent-activities`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load recent activities"
        );
      }

      setActivities(extractArray(data));
    } catch (error: any) {
      setActivitiesError(
        error?.message || "Failed to load recent activities"
      );
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const mergedNotificationItems = useMemo<CombinedItem[]>(() => {
    const mappedNotifications = notifications.map((item, index) => {
      const category = getCategoryFromContent(
        item.type,
        item.title,
        item.message,
        item.description
      );

      return {
        id: item.id ?? `notification-${index}`,
        icon: getIconByContent(
          item.type,
          item.title,
          item.message,
          item.description,
          "notification"
        ),
        title: item.title || item.message || "Notification",
        sub:
          item.description ||
          item.message ||
          "Latest system notification",
        time: formatTime(item.time || item.createdAt || item.created_at),
        rawTime: item.time || item.createdAt || item.created_at,
        kind: "notification" as const,
        type: item.type || "",
        normalizedCategory: category,
      };
    });

    const mappedActivities = activities.map((item, index) => {
      const category = getCategoryFromContent(
        item.type,
        item.title || item.action,
        item.message,
        item.description
      );

      return {
        id: item.id ?? `activity-${index}`,
        icon: getIconByContent(
          item.type,
          item.title || item.action,
          item.message,
          item.description,
          "activity"
        ),
        title: item.title || item.action || "Recent Activity",
        sub:
          item.description ||
          item.message ||
          "Latest system activity and updates",
        time: formatTime(item.time || item.createdAt || item.created_at),
        rawTime: item.time || item.createdAt || item.created_at,
        kind: "activity" as const,
        type: item.type || "",
        normalizedCategory: category,
      };
    });

    const merged = [...mappedNotifications, ...mappedActivities];

    return merged.sort((a, b) => {
      const aTime = a.rawTime ? new Date(a.rawTime).getTime() : 0;
      const bTime = b.rawTime ? new Date(b.rawTime).getTime() : 0;
      return bTime - aTime;
    });
  }, [notifications, activities]);

  const filteredNotificationItems = useMemo(() => {
    if (notificationFilter === "all") return mergedNotificationItems;

    if (notificationFilter === "notification") {
      return mergedNotificationItems.filter(
        (item) => item.kind === "notification"
      );
    }

    if (notificationFilter === "activity") {
      return mergedNotificationItems.filter(
        (item) => item.kind === "activity"
      );
    }

    return mergedNotificationItems.filter(
      (item) => item.normalizedCategory === notificationFilter
    );
  }, [mergedNotificationItems, notificationFilter]);

  const visibleItems = useMemo(() => {
    return filteredNotificationItems.slice(0, visibleCount);
  }, [filteredNotificationItems, visibleCount]);

  const hasMoreItems = visibleCount < filteredNotificationItems.length;

  const loadMoreItems = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_MORE_COUNT, filteredNotificationItems.length)
    );
  }, [filteredNotificationItems.length]);

  const handleNotificationScroll = useCallback(() => {
    const container = listContainerRef.current;
    if (!container || !hasMoreItems) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom <= SCROLL_THRESHOLD) {
      loadMoreItems();
    }
  }, [hasMoreItems, loadMoreItems]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-[22px] sm:text-[28px] font-semibold text-[#0F172A]">
          System Settings
        </h1>
        <p className="text-[12px] sm:text-[13px] text-[#64748B] mt-1">
          Manage companies, subscriptions, and licenses
        </p>
      </div>

      <div className="bg-white rounded-[18px] sm:rounded-2xl border border-[#EEF2F6] shadow-[0_6px_20px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex border-b border-[#F1F5F9] px-2 sm:px-6 overflow-x-auto no-scrollbar">
          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            icon={<Settings className="w-4 h-4 shrink-0" />}
            label="General"
          />

          <TabButton
            active={activeTab === "notification"}
            onClick={() => setActiveTab("notification")}
            icon={<Bell className="w-4 h-4 shrink-0" />}
            label="Notification"
          />

          <TabButton
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={<Shield className="w-4 h-4 shrink-0" />}
            label="Security"
          />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === "general" && (
            <div className="space-y-5 sm:space-y-6 max-w-[720px]">
              <FormField label="Company Name">
                <input
                  type="text"
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <FormField label="Time Zone">
                <input
                  type="text"
                  placeholder="Asia/Kolkata (IST)"
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <FormField label="Date Format">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <FormField label="Currency">
                <input
                  type="text"
                  placeholder="INR (₹)"
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <button className="mt-2 sm:mt-4 w-full sm:w-auto px-6 py-3 bg-[#1D4ED8] text-white rounded-xl text-[14px] sm:text-[15px] font-medium shadow-md hover:bg-[#1E40AF] transition">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "notification" && (
            <div className="space-y-5 sm:space-y-6 max-w-full">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <SectionTitle
                  title="Recent Activities"
                  subtitle="Latest System Activities and updates"
                />

                <div className="w-full sm:w-[260px]">
                  <label className="mb-2 flex items-center gap-2 text-[12px] font-medium text-[#475569]">
                    <ListFilter className="h-4 w-4" />
                    Filter
                  </label>

                  <select
                    value={notificationFilter}
                    onChange={(e) =>
                      setNotificationFilter(e.target.value as FilterType)
                    }
                    className="w-full h-[44px] rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="all">All</option>
                    <option value="notification">Notifications only</option>
                    <option value="activity">Activities only</option>
                    <option value="user">User</option>
                    <option value="inventory">Inventory</option>
                    <option value="sales">Sales / Payment</option>
                    <option value="alert">Alert / Warning</option>
                    <option value="system">System / Settings</option>
                    <option value="otp">OTP</option>
                  </select>
                </div>
              </div>

              <ActivityList
                ref={listContainerRef}
                items={visibleItems}
                totalItems={filteredNotificationItems.length}
                loading={notificationsLoading || activitiesLoading}
                error={notificationsError || activitiesError}
                onScroll={handleNotificationScroll}
                hasMore={hasMoreItems}
              />
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 sm:space-y-8 max-w-[900px]">
              <SectionTitle title="Recent Security Activity" />

              <SimpleCard
                title="New sign-in on Mac OS"
                subtitle="Jan 30 . India"
              />
              <SimpleCard
                title="New sign-in on Mac OS"
                subtitle="Jan 30 . India"
              />
              <SimpleCard
                title="New sign-in on Mac OS"
                subtitle="Jan 30 . India"
              />

              <SectionTitle
                title="How you sign in"
                subtitle="Make sure you can always access your Google Account by keeping this information up to date"
              />

              <SecurityOption
                icon={<KeyRound className="w-5 h-5" />}
                title="Change Password"
                subtitle="Use password reset flow from login screen"
              />

              <SecurityOption
                icon={<Smartphone className="w-5 h-5" />}
                title="Recovery Phone"
                subtitle="Enter you Phone Number"
              />

              <SecurityOption
                icon={<Mail className="w-5 h-5" />}
                title="Recovery Email"
                subtitle="Enter you Email"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 text-[13px] sm:text-[14px] font-medium relative transition ${
        active
          ? "text-[#2563EB]"
          : "text-[#64748B] hover:text-[#0F172A]"
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2563EB] rounded-full" />
      )}
    </button>
  );
}

function FormField({ label, children }: any) {
  return (
    <div>
      <label className="block text-[13px] sm:text-[14px] text-[#475569] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }: any) {
  return (
    <div>
      <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#0F172A]">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[12px] text-[#64748B] mt-1 leading-[1.5]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

const ActivityList = React.forwardRef<
  HTMLDivElement,
  {
    items: {
      id: string | number;
      icon: React.ReactNode;
      title: string;
      sub: string;
      time: string;
    }[];
    totalItems: number;
    loading: boolean;
    error: string;
    onScroll: () => void;
    hasMore: boolean;
  }
>(function ActivityList(
  { items, totalItems, loading, error, onScroll, hasMore },
  ref
) {
  if (loading) {
    return (
      <div className="max-h-[520px] overflow-y-auto pr-1 space-y-3 sm:space-y-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="rounded-xl px-4 sm:px-5 py-4 bg-[#F8FAFC] animate-pulse"
          >
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-[#E5E7EB] shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-[140px] bg-[#E5E7EB] rounded" />
                  <div className="h-3 w-[190px] bg-[#E5E7EB] rounded mt-2" />
                </div>
              </div>
              <div className="h-3 w-[70px] bg-[#E5E7EB] rounded shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-6 text-center text-[13px] text-[#64748B]">
        No notifications or recent activities found.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="max-h-[520px] overflow-y-auto pr-1 space-y-3 sm:space-y-4"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F8FAFC] rounded-xl px-4 sm:px-5 py-4 hover:bg-[#F1F5F9] transition"
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#2563EB] shrink-0">
              {item.icon}
            </div>

            <div className="min-w-0">
              <p className="text-[14px] font-medium text-[#0F172A] break-words">
                {item.title}
              </p>
              <p className="text-[12px] text-[#64748B] break-words">
                {item.sub}
              </p>
            </div>
          </div>

          <span className="text-[12px] text-[#94A3B8] sm:text-right pl-[48px] sm:pl-0">
            {item.time}
          </span>
        </div>
      ))}

      {hasMore && (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-center text-[12px] text-[#64748B]">
          Scroll to load more items...
        </div>
      )}

      {!hasMore && totalItems > 0 && (
        <div className="px-2 py-1 text-center text-[12px] text-[#94A3B8]">
          Showing all {totalItems} items
        </div>
      )}
    </div>
  );
});

function SimpleCard({ title, subtitle }: any) {
  return (
    <div className="bg-[#F8FAFC] rounded-xl px-4 sm:px-6 py-4">
      <p className="text-[14px] sm:text-[15px] font-medium text-[#0F172A]">
        {title}
      </p>
      <p className="text-[12px] text-[#64748B] mt-1">{subtitle}</p>
    </div>
  );
}

function SecurityOption({ icon, title, subtitle }: any) {
  return (
    <div className="bg-[#F8FAFC] rounded-xl px-4 sm:px-6 py-4 flex items-start sm:items-center gap-4 hover:bg-[#F1F5F9] transition">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-[#E2E8F0] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[#0F172A] break-words">
          {title}
        </p>
        <p className="text-[12px] text-[#64748B] mt-1 break-words">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function formatTime(value?: string) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} minutes ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hours ago`;
  if (diffMs < day * 7) return `${Math.floor(diffMs / day)} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCategoryFromContent(
  type?: string,
  title?: string,
  message?: string,
  description?: string
) {
  const combined = `${type || ""} ${title || ""} ${message || ""} ${
    description || ""
  }`.toLowerCase();

  if (
    combined.includes("otp") ||
    combined.includes("verification") ||
    combined.includes("verify") ||
    combined.includes("reset-password") ||
    combined.includes("password-reset") ||
    combined.includes("request-password-reset") ||
    combined.includes("password reset")
  ) {
    return "otp" as const;
  }

  if (
    combined.includes("user") ||
    combined.includes("register") ||
    combined.includes("login")
  ) {
    return "user" as const;
  }

  if (
    combined.includes("stock") ||
    combined.includes("inventory") ||
    combined.includes("product")
  ) {
    return "inventory" as const;
  }

  if (
    combined.includes("sale") ||
    combined.includes("payment") ||
    combined.includes("transaction")
  ) {
    return "sales" as const;
  }

  if (
    combined.includes("alert") ||
    combined.includes("warning") ||
    combined.includes("error")
  ) {
    return "alert" as const;
  }

  if (
    combined.includes("setting") ||
    combined.includes("config") ||
    combined.includes("system")
  ) {
    return "system" as const;
  }

  return "other" as const;
}

function getIconByContent(
  type?: string,
  title?: string,
  message?: string,
  description?: string,
  fallback?: "notification" | "activity"
) {
  const combined = `${type || ""} ${title || ""} ${message || ""} ${
    description || ""
  }`.toLowerCase();

  if (
    combined.includes("otp") ||
    combined.includes("verification") ||
    combined.includes("verify") ||
    combined.includes("reset-password") ||
    combined.includes("password-reset") ||
    combined.includes("request-password-reset") ||
    combined.includes("password reset")
  ) {
    return <KeyRound className="w-4 h-4" />;
  }

  if (
    combined.includes("user") ||
    combined.includes("register") ||
    combined.includes("login")
  ) {
    return <User className="w-4 h-4" />;
  }

  if (
    combined.includes("stock") ||
    combined.includes("inventory") ||
    combined.includes("product")
  ) {
    return <Package className="w-4 h-4" />;
  }

  if (
    combined.includes("sale") ||
    combined.includes("payment") ||
    combined.includes("transaction")
  ) {
    return <DollarSign className="w-4 h-4" />;
  }

  if (
    combined.includes("alert") ||
    combined.includes("warning") ||
    combined.includes("error")
  ) {
    return <AlertTriangle className="w-4 h-4" />;
  }

  if (
    combined.includes("setting") ||
    combined.includes("config") ||
    combined.includes("system")
  ) {
    return <Settings className="w-4 h-4" />;
  }

  if (fallback === "notification") {
    return <Bell className="w-4 h-4" />;
  }

  return <Settings className="w-4 h-4" />;
}