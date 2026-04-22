"use client";

import {
  Bell,
  X,
  Check,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  Shield,
  KeyRound,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
  url: string;
  read?: boolean;
};

type ToastItem = NotificationItem & {
  localId: string;
  timeText: string;
};

type NotificationApiShape = {
  id?: string | number;
  _id?: string | number;
  title?: string;
  subject?: string;
  message?: string;
  description?: string;
  content?: string;
  createdAt?: string;
  created_at?: string;
  time?: string;
  date?: string;
  type?: string;
  url?: string;
  link?: string;
  read?: boolean;
  isRead?: boolean;
};

type Props = {
  apiBase?: string;
  listEndpoint?: string;
  pollIntervalMs?: number;
  defaultOpenUrl?: string;
  title?: string;
  maxToasts?: number;
};

const LOCAL_READ_KEY = "erp_notification_read_ids_v1";
const LOCAL_KNOWN_KEY = "erp_notification_known_ids_v1";
const LOCAL_PERMISSION_BANNER_DISMISSED_KEY =
  "erp_notification_banner_dismissed_v1";

function getStoredToken() {
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
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readLocalSet(key: string) {
  if (typeof window === "undefined") return new Set<string>();
  const values = safeJsonParse<string[]>(localStorage.getItem(key), []);
  return new Set(values);
}

function writeLocalSet(key: string, values: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(Array.from(values)));
}

function normalizeNotifications(payload: any): NotificationItem[] {
  const raw =
    (Array.isArray(payload) && payload) ||
    payload?.data ||
    payload?.notifications ||
    payload?.result ||
    payload?.items ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: NotificationApiShape, index: number) => {
      const rawId =
        item?.id ??
        item?._id ??
        `${item?.createdAt || item?.created_at || item?.time || Date.now()}-${index}`;

      return {
        id: String(rawId),
        title: item?.title || item?.subject || "Notification",
        message:
          item?.message ||
          item?.description ||
          item?.content ||
          "You have a new notification",
        createdAt:
          item?.createdAt ||
          item?.created_at ||
          item?.time ||
          item?.date ||
          new Date().toISOString(),
        type: item?.type || "",
        url: item?.url || item?.link || "",
        read: Boolean(item?.read ?? item?.isRead ?? false),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

function formatTime(value?: string) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs} hr ago`;
  if (days < 7) return `${days} day ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getNotificationMeta(type?: string, title?: string, message?: string) {
  const text = `${type || ""} ${title || ""} ${message || ""}`.toLowerCase();

  if (
    text.includes("otp") ||
    text.includes("verify") ||
    text.includes("password reset") ||
    text.includes("reset-password")
  ) {
    return {
      label: "Security",
      icon: <KeyRound className="h-4 w-4" />,
      iconWrap: "bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]",
      dot: "bg-[#8B5CF6]",
      toastAccent: "from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]",
      toastGlow: "shadow-[0_10px_30px_rgba(124,58,237,0.16)]",
    };
  }

  if (
    text.includes("alert") ||
    text.includes("warning") ||
    text.includes("error")
  ) {
    return {
      label: "Alert",
      icon: <AlertTriangle className="h-4 w-4" />,
      iconWrap: "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]",
      dot: "bg-[#F59E0B]",
      toastAccent: "from-[#f59e0b] via-[#f59e0b] to-[#d97706]",
      toastGlow: "shadow-[0_10px_30px_rgba(245,158,11,0.16)]",
    };
  }

  if (
    text.includes("stock") ||
    text.includes("inventory") ||
    text.includes("product")
  ) {
    return {
      label: "Inventory",
      icon: <Package className="h-4 w-4" />,
      iconWrap: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
      dot: "bg-[#2563EB]",
      toastAccent: "from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]",
      toastGlow: "shadow-[0_10px_30px_rgba(37,99,235,0.16)]",
    };
  }

  if (
    text.includes("login") ||
    text.includes("security") ||
    text.includes("access")
  ) {
    return {
      label: "Access",
      icon: <Shield className="h-4 w-4" />,
      iconWrap: "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]",
      dot: "bg-[#10B981]",
      toastAccent: "from-[#10b981] via-[#059669] to-[#047857]",
      toastGlow: "shadow-[0_10px_30px_rgba(5,150,105,0.16)]",
    };
  }

  if (
    text.includes("success") ||
    text.includes("approved") ||
    text.includes("completed")
  ) {
    return {
      label: "Update",
      icon: <CheckCircle2 className="h-4 w-4" />,
      iconWrap: "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
      dot: "bg-[#22C55E]",
      toastAccent: "from-[#34d399] via-[#10b981] to-[#059669]",
      toastGlow: "shadow-[0_10px_30px_rgba(16,185,129,0.16)]",
    };
  }

  return {
    label: "Notification",
    icon: <Info className="h-4 w-4" />,
    iconWrap: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
    dot: "bg-[#3B82F6]",
    toastAccent: "from-[#60a5fa] via-[#3b82f6] to-[#2563eb]",
    toastGlow: "shadow-[0_10px_30px_rgba(59,130,246,0.16)]",
  };
}

async function ensureServiceWorkerRegistered() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  try {
    return await navigator.serviceWorker.register("/notification-sw.js");
  } catch (error) {
    console.error("Notification service worker registration failed:", error);
    return null;
  }
}

async function askNotificationPermission() {
  if (typeof window === "undefined") return "default";
  if (!("Notification" in window)) return "denied";

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error("Notification permission request failed:", error);
    return "denied";
  }
}

async function showBrowserNotification(
  item: NotificationItem,
  fallbackUrl: string
) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const registration =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration()
      : null;

  const targetUrl = item.url || fallbackUrl;

  if (registration) {
    await registration.showNotification(item.title, {
      body: item.message,
      tag: String(item.id),
      renotify: false,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: targetUrl },
    });
    return;
  }

  const n = new Notification(item.title, {
    body: item.message,
    tag: String(item.id),
    icon: "/favicon.ico",
  });

  n.onclick = () => {
    window.focus();
    window.location.href = targetUrl;
  };
}

function NotificationRow({
  item,
  unread,
  onOpen,
  onMarkRead,
}: {
  item: NotificationItem;
  unread: boolean;
  onOpen: (item: NotificationItem) => void;
  onMarkRead: (id: string) => void;
}) {
  const meta = getNotificationMeta(item.type, item.title, item.message);

  return (
    <div
      onClick={() => onOpen(item)}
      className={`group cursor-pointer rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
        unread ? "border-[#DBEAFE] bg-[#F8FBFF]" : "border-[#EEF2F6] bg-white"
      } hover:border-[#D6E4F5] hover:bg-[#FBFDFF]`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.iconWrap}`}
        >
          {meta.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#0F172A]">
                  {item.title}
                </span>
                {unread ? (
                  <span className={`inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
                ) : null}
              </div>

              <p className="line-clamp-2 text-[12px] leading-5 text-[#64748B]">
                {item.message}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-medium text-[#94A3B8]">
                  {meta.label}
                </span>
                <span className="text-[11px] text-[#CBD5E1]">•</span>
                <span className="text-[11px] font-medium text-[#94A3B8]">
                  {formatTime(item.createdAt)}
                </span>
              </div>
            </div>

            {unread ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(item.id);
                }}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#64748B] transition hover:bg-white hover:text-[#0F172A]"
                aria-label="Mark notification as read"
              >
                <Check className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardNotificationToast({
  apiBase,
  listEndpoint = "/sql/notifications",
  pollIntervalMs = 15000,
  defaultOpenUrl = "/super-admin",
  title = "Notifications",
  maxToasts = 4,
}: Props) {
  const API_BASE = useMemo(
    () =>
      apiBase ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://ims-backend-nm9g.onrender.com",
    [apiBase]
  );

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [permission, setPermission] = useState<"default" | "granted" | "denied">(
    "default"
  );
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const firstFetchDoneRef = useRef(false);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const readIdsRef = useRef<Set<string>>(new Set());
  const timeoutMapRef = useRef<Map<string, number>>(new Map());
  const pollingRef = useRef<number | null>(null);

  const unreadCount = useMemo(
    () =>
      items.filter((item) => !readIdsRef.current.has(item.id) && !item.read)
        .length,
    [items]
  );

  const removeToast = useCallback((localId: string) => {
    const timeoutId = timeoutMapRef.current.get(localId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(localId);
    }

    setToasts((prev) => prev.filter((item) => item.localId !== localId));
  }, []);

  const markAsRead = useCallback((id: string) => {
    readIdsRef.current.add(id);
    writeLocalSet(LOCAL_READ_KEY, readIdsRef.current);

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const next = new Set(readIdsRef.current);
    items.forEach((item) => next.add(item.id));
    readIdsRef.current = next;
    writeLocalSet(LOCAL_READ_KEY, readIdsRef.current);

    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }, [items]);

  const openItem = useCallback(
    (item: NotificationItem) => {
      markAsRead(item.id);
      const target = item.url || defaultOpenUrl;
      window.location.href = target;
    },
    [defaultOpenUrl, markAsRead]
  );

  const pushToasts = useCallback(
    async (freshItems: NotificationItem[]) => {
      if (!freshItems.length) return;

      const prepared: ToastItem[] = freshItems.slice(0, maxToasts).map((item, index) => ({
        ...item,
        localId: `${item.id}-${Date.now()}-${index}`,
        timeText: formatTime(item.createdAt),
      }));

      setToasts((prev) => [...prepared, ...prev].slice(0, maxToasts));

      for (const toast of prepared) {
        const timeoutId = window.setTimeout(() => {
          removeToast(toast.localId);
        }, 7200);

        timeoutMapRef.current.set(toast.localId, timeoutId);

        if (document.visibilityState !== "visible") {
          await showBrowserNotification(toast, defaultOpenUrl);
        }
      }
    },
    [defaultOpenUrl, maxToasts, removeToast]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const token = getStoredToken();

      const res = await fetch(`${API_BASE}${listEndpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          json?.message || `Notification fetch failed (${res.status})`
        );
      }

      const normalized = normalizeNotifications(json).map((item) => ({
        ...item,
        read: Boolean(item.read || readIdsRef.current.has(item.id)),
      }));

      setFetchError("");
      setItems(normalized);

      const currentIds = new Set(normalized.map((item) => item.id));

      if (!firstFetchDoneRef.current) {
        knownIdsRef.current = currentIds;
        writeLocalSet(LOCAL_KNOWN_KEY, knownIdsRef.current);
        firstFetchDoneRef.current = true;
        return;
      }

      const freshItems = normalized.filter(
        (item) => !knownIdsRef.current.has(item.id)
      );

      freshItems.forEach((item) => knownIdsRef.current.add(item.id));
      writeLocalSet(LOCAL_KNOWN_KEY, knownIdsRef.current);

      await pushToasts(freshItems);
    } catch (error: any) {
      console.error("Notification fetch failed:", error);
      setFetchError(error?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, listEndpoint, pushToasts]);

  const handleEnableNotifications = useCallback(async () => {
    try {
      setPermissionLoading(true);

      await ensureServiceWorkerRegistered();
      const result = await askNotificationPermission();
      setPermission(result);

      if (result === "granted") {
        setShowPermissionBanner(false);
        localStorage.setItem(LOCAL_PERMISSION_BANNER_DISMISSED_KEY, "1");

        const demo: NotificationItem = {
          id: `permission-${Date.now()}`,
          title: "Browser notifications enabled",
          message:
            "You’ll now receive browser alerts when the app is in background.",
          createdAt: new Date().toISOString(),
          type: "success",
          url: defaultOpenUrl,
          read: false,
        };

        await pushToasts([demo]);
      }
    } catch (error) {
      console.error("Enable notifications failed:", error);
    } finally {
      setPermissionLoading(false);
    }
  }, [defaultOpenUrl, pushToasts]);

  useEffect(() => {
    readIdsRef.current = readLocalSet(LOCAL_READ_KEY);

    const storedKnown = readLocalSet(LOCAL_KNOWN_KEY);
    if (storedKnown.size) {
      knownIdsRef.current = storedKnown;
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }

    const dismissed =
      typeof window !== "undefined" &&
      localStorage.getItem(LOCAL_PERMISSION_BANNER_DISMISSED_KEY) === "1";

    setShowPermissionBanner(!dismissed);

    ensureServiceWorkerRegistered();
    fetchNotifications();

    pollingRef.current = window.setInterval(() => {
      fetchNotifications();
    }, pollIntervalMs);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }

      timeoutMapRef.current.forEach((id) => window.clearTimeout(id));
      timeoutMapRef.current.clear();
    };
  }, [fetchNotifications, pollIntervalMs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setDrawerOpen((prev) => !prev)}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1.5 py-[2px] text-[10px] font-bold text-white shadow">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>

        {drawerOpen ? (
          <>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
              aria-label="Close notifications panel"
            />

            <div className="fixed right-3 top-[76px] z-[9999] h-[min(78vh,720px)] w-[calc(100vw-24px)] max-w-[400px] overflow-hidden rounded-[24px] border border-[#E8EEF5] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] sm:right-5 sm:top-[78px] sm:max-w-[420px]">
              <div className="border-b border-[#EEF2F6] px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-[#111827]">
                      {title}
                    </p>
                    <p className="mt-1 text-[12px] text-[#667085]">
                      {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-[12px] font-semibold text-[#344054] transition hover:bg-[#F8FAFC]"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Read all
                    </button>

                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F8FAFC]"
                      aria-label="Close notifications panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {fetchError ? (
                <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {fetchError}
                </div>
              ) : null}

              <div className="h-[calc(100%-81px)] overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-[#667085]">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading notifications...
                  </div>
                ) : items.length ? (
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        unread={!item.read}
                        onOpen={openItem}
                        onMarkRead={markAsRead}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-[#DCE4EC] bg-[#FAFBFC] px-6 text-center">
                    <Bell className="h-8 w-8 text-[#94A3B8]" />
                    <p className="mt-3 text-[15px] font-semibold text-[#0F172A]">
                      No notifications yet
                    </p>
                    <p className="mt-1 text-[13px] text-[#64748B]">
                      New system updates and activity alerts will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {permission !== "granted" && showPermissionBanner ? (
        <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[2147483647] flex justify-center sm:inset-x-auto sm:bottom-4 sm:left-4 sm:block">
          <div className="pointer-events-auto w-full max-w-[380px] overflow-hidden rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.96)] shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div className="h-[4px] w-full bg-[linear-gradient(90deg,#7c3aed_0%,#2563eb_50%,#06b6d4_100%)]" />

            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#eff6ff_0%,#ede9fe_100%)] text-[#4f46e5] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <Bell className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#7c3aed]" />
                    <p className="text-[13px] font-[700] tracking-[0.01em] text-[#111827]">
                      Enable browser alerts
                    </p>
                  </div>

                  <p className="mt-1.5 text-[12px] leading-5 text-[#667085]">
                    In-app notifications already work. Enable browser alerts only if you want updates outside the app.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleEnableNotifications}
                      disabled={permissionLoading}
                      className="inline-flex min-h-[42px] items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-3.5 py-2 text-[12px] font-[700] text-white shadow-[0_10px_24px_rgba(17,24,39,0.22)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {permissionLoading ? "Enabling..." : "Enable now"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPermissionBanner(false);
                        localStorage.setItem(
                          LOCAL_PERMISSION_BANNER_DISMISSED_KEY,
                          "1"
                        );
                      }}
                      className="inline-flex min-h-[42px] items-center justify-center rounded-[12px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[12px] font-[700] text-[#344054]"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!toasts.length ? null : (
        <div className="pointer-events-none fixed inset-x-3 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[2147483646] flex flex-col gap-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[390px]">
          {toasts.map((toast) => {
            const meta = getNotificationMeta(
              toast.type,
              toast.title,
              toast.message
            );

            return (
              <div
                key={toast.localId}
                className={`pointer-events-auto relative overflow-hidden rounded-[22px] border border-white/60 bg-[rgba(255,255,255,0.96)] shadow-[0_20px_50px_rgba(15,23,42,0.18)] ${meta.toastGlow}`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r ${meta.toastAccent}`}
                />

                <div
                  onClick={() => openItem(toast)}
                  className="cursor-pointer px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${meta.iconWrap}`}
                    >
                      {meta.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-[#111827]">
                              {toast.title}
                            </span>
                            <span
                              className={`inline-flex h-2 w-2 rounded-full ${meta.dot}`}
                            />
                          </div>

                          <p className="text-[12px] leading-5 text-[#667085]">
                            {toast.message}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[11px] font-medium text-[#94A3B8]">
                              {meta.label}
                            </span>
                            <span className="text-[11px] text-[#CBD5E1]">•</span>
                            <span className="text-[11px] font-medium text-[#94A3B8]">
                              {toast.timeText}
                            </span>
                          </div>

                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(toast.id);
                                removeToast(toast.localId);
                              }}
                              className="inline-flex min-h-[36px] items-center rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] font-semibold text-[#344054] transition hover:bg-[#F8FAFC]"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeToast(toast.localId);
                          }}
                          className="rounded-full p-1.5 text-[#98A2B3] transition hover:bg-white/80 hover:text-[#344054]"
                          aria-label="Close notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative h-[3px] w-full overflow-hidden bg-[#EEF2F7]">
                  <div
                    className={`toast-progress h-full w-full bg-gradient-to-r ${meta.toastAccent}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .toast-progress {
          animation: toast-progress 7.2s linear forwards;
        }

        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
}