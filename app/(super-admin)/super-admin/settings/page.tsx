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
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

type SystemSettingsForm = {
  companyName: string;
  timeZone: string;
  dateFormat: string;
  currency: string;
};

type RecoveryForm = {
  recoveryPhone: string;
  recoveryEmail: string;
};

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type OtpResetForm = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

type SecurityOverview = {
  recentActivities?: Array<{
    id?: string | number;
    title?: string;
    subtitle?: string;
    location?: string;
    time?: string;
    createdAt?: string;
    created_at?: string;
  }>;
  recoveryEmail?: string;
  recoveryPhone?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
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

  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalMessage, setGeneralMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [recoverySaving, setRecoverySaving] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const router = useRouter();

  const [settingsForm, setSettingsForm] = useState<SystemSettingsForm>({
    companyName: "",
    timeZone: "Asia/Kolkata (IST)",
    dateFormat: "DD/MM/YYYY",
    currency: "INR (₹)",
  });

  const [securityOverview, setSecurityOverview] = useState<SecurityOverview>({
    recentActivities: [],
    recoveryEmail: "",
    recoveryPhone: "",
  });

  const [recoveryForm, setRecoveryForm] = useState<RecoveryForm>({
    recoveryPhone: "",
    recoveryEmail: "",
  });

  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [otpResetForm, setOtpResetForm] = useState<OtpResetForm>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-swp9.onrender.com";

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "notification") {
      fetchNotifications();
      fetchRecentActivities();
    }

    if (activeTab === "security") {
      fetchSecurityOverview();
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

  const getHeaders = (includeContentType = true) => {
    const token = getStoredToken();

    return {
      ...(includeContentType ? { "Content-Type": "application/json" } : {}),
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

  const extractObject = (data: any) => {
    if (!data) return {};
    if (typeof data !== "object") return {};
    if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
      return data.data;
    }
    return data;
  };

  const getValue = (obj: any, keys: string[], fallback = "") => {
    for (const key of keys) {
      if (obj?.[key] !== undefined && obj?.[key] !== null) {
        return String(obj[key]);
      }
    }
    return fallback;
  };

  const fetchSystemSettings = async () => {
    try {
      setGeneralLoading(true);
      setGeneralError("");
      setGeneralMessage("");

      const res = await fetch(`${API_BASE}/system-setting/get/system-settings`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load system settings"
        );
      }

      const payload = extractObject(data);

      setSettingsForm({
        companyName: getValue(payload, [
          "companyName",
          "company_name",
          "organizationName",
          "organisationName",
          "businessName",
          "name",
        ]),
        timeZone: getValue(payload, ["timeZone", "time_zone"], "Asia/Kolkata (IST)"),
        dateFormat: getValue(payload, ["dateFormat", "date_format"], "DD/MM/YYYY"),
        currency: getValue(payload, ["currency", "currencyCode"], "INR (₹)"),
      });
    } catch (error: any) {
      setGeneralError(error?.message || "Failed to load system settings");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setGeneralSaving(true);
      setGeneralError("");
      setGeneralMessage("");

      const payload = {
        companyName: settingsForm.companyName,
        timeZone: settingsForm.timeZone,
        dateFormat: settingsForm.dateFormat,
        currency: settingsForm.currency,
      };

      const res = await fetch(`${API_BASE}/system-setting/update/system`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to save system settings"
        );
      }

      setGeneralMessage(
        data?.message || "System settings updated successfully"
      );
      await fetchSystemSettings();
    } catch (error: any) {
      setGeneralError(error?.message || "Failed to save system settings");
    } finally {
      setGeneralSaving(false);
    }
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
      setNotificationsError(error?.message || "Failed to load notifications");
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
      setActivitiesError(error?.message || "Failed to load recent activities");
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchSecurityOverview = async () => {
    try {
      setSecurityLoading(true);
      setSecurityError("");
      setSecurityMessage("");

      const res = await fetch(`${API_BASE}/system-setting/get/security`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load security overview"
        );
      }

      const payload = extractObject(data);

      const recentActivitiesPayload =
        extractArray(payload?.recentActivities).length > 0
          ? extractArray(payload?.recentActivities)
          : extractArray(payload);

      setSecurityOverview({
        ...payload,
        recentActivities: recentActivitiesPayload,
      });

      setRecoveryForm({
        recoveryPhone: getValue(payload, ["recoveryPhone", "recovery_phone", "phone"]),
        recoveryEmail: getValue(payload, ["recoveryEmail", "recovery_email", "email"]),
      });

      setOtpResetForm((prev) => ({
        ...prev,
        email:
          prev.email ||
          getValue(payload, ["recoveryEmail", "recovery_email", "email"]),
      }));
    } catch (error: any) {
      setSecurityError(error?.message || "Failed to load security overview");
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordSaving(true);
      setPasswordError("");
      setPasswordMessage("");

      if (!passwordForm.currentPassword.trim()) {
        throw new Error("Current password is required");
      }

      if (!passwordForm.newPassword.trim()) {
        throw new Error("New password is required");
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      const res = await fetch(`${API_BASE}/change-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to change password"
        );
      }

      setPasswordMessage(data?.message || "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      await fetchSecurityOverview();
    } catch (error: any) {
      setPasswordError(error?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleUpdateRecovery = async () => {
    try {
      setRecoverySaving(true);
      setRecoveryError("");
      setRecoveryMessage("");

      const res = await fetch(`${API_BASE}/update/recovery`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          recoveryPhone: recoveryForm.recoveryPhone,
          recoveryEmail: recoveryForm.recoveryEmail,
        }),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to update recovery details"
        );
      }

      setRecoveryMessage(
        data?.message || "Recovery details updated successfully"
      );
      await fetchSecurityOverview();
    } catch (error: any) {
      setRecoveryError(
        error?.message || "Failed to update recovery details"
      );
    } finally {
      setRecoverySaving(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setOtpSending(true);
      setOtpError("");
      setOtpMessage("");

      if (!otpResetForm.email.trim()) {
        throw new Error("Recovery email is required");
      }

      const res = await fetch(`${API_BASE}/super-admin/send-reset-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          email: otpResetForm.email,
        }),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to send OTP"
        );
      }

      setOtpMessage(data?.message || "OTP sent successfully");
    } catch (error: any) {
      setOtpError(error?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpAndReset = async () => {
    try {
      setOtpVerifying(true);
      setOtpError("");
      setOtpMessage("");

      if (!otpResetForm.email.trim()) {
        throw new Error("Recovery email is required");
      }

      if (!otpResetForm.otp.trim()) {
        throw new Error("OTP is required");
      }

      if (!otpResetForm.newPassword.trim()) {
        throw new Error("New password is required");
      }

      if (otpResetForm.newPassword !== otpResetForm.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      const res = await fetch(`${API_BASE}/super-admin/verify-reset-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          email: otpResetForm.email,
          otp: otpResetForm.otp,
          newPassword: otpResetForm.newPassword,
          confirmPassword: otpResetForm.confirmPassword,
        }),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to verify OTP and reset password"
        );
      }

      setOtpMessage(data?.message || "Password reset successfully");
      setOtpResetForm((prev) => ({
        ...prev,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      }));
      await fetchSecurityOverview();
    } catch (error: any) {
      setOtpError(
        error?.message || "Failed to verify OTP and reset password"
      );
    } finally {
      setOtpVerifying(false);
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

  const securityActivityCards = useMemo(() => {
    const list = extractArray(securityOverview?.recentActivities);

    if (list.length) {
      return list.slice(0, 3).map((item: any, index: number) => ({
        id: item?.id ?? index,
        title: item?.title || "Recent security activity",
        subtitle:
          item?.subtitle ||
          item?.description ||
          `${formatTime(item?.time || item?.createdAt || item?.created_at)}${item?.location ? ` . ${item.location}` : ""
          }`,
      }));
    }

    return [
      {
        id: 1,
        title: "New sign-in activity",
        subtitle: "Recently . India",
      },
      {
        id: 2,
        title: "Account security checked",
        subtitle: "Recently . India",
      },
      {
        id: 3,
        title: "Recovery details available",
        subtitle: "Recently . India",
      },
    ];
  }, [securityOverview]);

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
            <div className="space-y-5 sm:space-y-6 max-w-full">
              {generalError && <ErrorMessage message={generalError} />}
              {generalMessage && <SuccessMessage message={generalMessage} />}

              <FormField label="Company Name">
                <input
                  type="text"
                  value={settingsForm.companyName}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  disabled={generalLoading || generalSaving}
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                />
              </FormField>

              <FormField label="Time Zone">
                <input
                  type="text"
                  placeholder="Asia/Kolkata (IST)"
                  value={settingsForm.timeZone}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      timeZone: e.target.value,
                    }))
                  }
                  disabled={generalLoading || generalSaving}
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                />
              </FormField>

              <FormField label="Date Format">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={settingsForm.dateFormat}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      dateFormat: e.target.value,
                    }))
                  }
                  disabled={generalLoading || generalSaving}
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                />
              </FormField>

              <FormField label="Currency">
                <input
                  type="text"
                  placeholder="INR (₹)"
                  value={settingsForm.currency}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  disabled={generalLoading || generalSaving}
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                />
              </FormField>

              <button
                onClick={handleSaveGeneral}
                disabled={generalLoading || generalSaving}
                className="mt-2 sm:mt-4 w-full sm:w-auto px-6 py-3 bg-[#1D4ED8] text-white rounded-xl text-[14px] sm:text-[15px] font-medium shadow-md hover:bg-[#1E40AF] transition disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {(generalLoading || generalSaving) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {generalSaving ? "Saving..." : "Save Changes"}
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
            <div className="space-y-6 sm:space-y-8 max-w-full">
              {securityError && <ErrorMessage message={securityError} />}
              {securityMessage && <SuccessMessage message={securityMessage} />}

              <SectionTitle title="Recent Security Activity" />

              {securityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl px-4 sm:px-6 py-4 bg-[#F8FAFC] animate-pulse"
                    >
                      <div className="h-4 w-[180px] bg-[#E5E7EB] rounded" />
                      <div className="h-3 w-[120px] bg-[#E5E7EB] rounded mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                securityActivityCards.map((item) => (
                  <SimpleCard
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                  />
                ))
              )}

              <SectionTitle
                title="How you sign in"
                subtitle="Make sure you can always access your Google Account by keeping this information up to date"
              />

              <div className="space-y-4">
                <SecurityOption
                  icon={<KeyRound className="w-5 h-5" />}
                  title="Change Password"
                  subtitle="Use your current password to set a new one"
                  onClick={() => router.push("/Resetpassword")}
                  
                />

                <SecurityOption
                  icon={<Mail className="w-5 h-5" />}
                  title="Recovery Email"
                  subtitle="Enter your email"
                />

              </div>
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
      className={`flex shrink-0 items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 text-[13px] sm:text-[14px] font-medium relative transition ${active
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

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
      {message}
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[13px] text-[#1D4ED8]">
      {message}
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

function SecurityOption({ icon, title, subtitle,  onClick }: any) {
  return (
    <div className="bg-[#F8FAFC] rounded-xl px-4 sm:px-6 py-4 flex items-start sm:items-center gap-4 hover:bg-[#F1F5F9] transition" onClick={onClick} >
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
  const combined = `${type || ""} ${title || ""} ${message || ""} ${description || ""
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
  const combined = `${type || ""} ${title || ""} ${message || ""} ${description || ""
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