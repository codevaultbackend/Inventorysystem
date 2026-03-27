"use client";

import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Package,
  Shield,
  KeyRound,
  Info,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type NotificationItem = {
  id?: string | number;
  title?: string;
  message?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
  time?: string;
  type?: string;
  url?: string;
};

type ToastItem = {
  localId: string;
  id: string | number;
  title: string;
  message: string;
  timeText: string;
  type: string;
  url?: string;
};

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

function normalizeNotifications(payload: any): NotificationItem[] {
  const raw =
    (Array.isArray(payload) && payload) ||
    payload?.data ||
    payload?.notifications ||
    payload?.result ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item: any, index: number) => ({
    id: item?.id ?? `notification-${index}`,
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
      "",
    type: item?.type || "",
    url: item?.url || item?.link || "",
  }));
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
      icon: <KeyRound className="h-[15px] w-[15px]" />,
      iconWrap:
        "bg-[linear-gradient(135deg,#f5f3ff_0%,#ede9fe_100%)] text-[#6d28d9] border border-[#ddd6fe]",
      badge:
        "bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]",
      accent:
        "from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]",
      glow: "shadow-[0_10px_30px_rgba(124,58,237,0.18)]",
    };
  }

  if (
    text.includes("alert") ||
    text.includes("warning") ||
    text.includes("error")
  ) {
    return {
      label: "Alert",
      icon: <AlertTriangle className="h-[15px] w-[15px]" />,
      iconWrap:
        "bg-[linear-gradient(135deg,#fffbeb_0%,#fef3c7_100%)] text-[#b45309] border border-[#fde68a]",
      badge:
        "bg-[#fffbeb] text-[#b45309] border border-[#fde68a]",
      accent:
        "from-[#f59e0b] via-[#f59e0b] to-[#d97706]",
      glow: "shadow-[0_10px_30px_rgba(245,158,11,0.18)]",
    };
  }

  if (
    text.includes("stock") ||
    text.includes("inventory") ||
    text.includes("product")
  ) {
    return {
      label: "Inventory",
      icon: <Package className="h-[15px] w-[15px]" />,
      iconWrap:
        "bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] text-[#1d4ed8] border border-[#bfdbfe]",
      badge:
        "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]",
      accent:
        "from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]",
      glow: "shadow-[0_10px_30px_rgba(37,99,235,0.18)]",
    };
  }

  if (
    text.includes("login") ||
    text.includes("security") ||
    text.includes("access")
  ) {
    return {
      label: "Access",
      icon: <Shield className="h-[15px] w-[15px]" />,
      iconWrap:
        "bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_100%)] text-[#047857] border border-[#a7f3d0]",
      badge:
        "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]",
      accent:
        "from-[#10b981] via-[#059669] to-[#047857]",
      glow: "shadow-[0_10px_30px_rgba(5,150,105,0.18)]",
    };
  }

  if (
    text.includes("success") ||
    text.includes("approved") ||
    text.includes("completed")
  ) {
    return {
      label: "Update",
      icon: <CheckCircle2 className="h-[15px] w-[15px]" />,
      iconWrap:
        "bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_100%)] text-[#059669] border border-[#a7f3d0]",
      badge:
        "bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]",
      accent:
        "from-[#34d399] via-[#10b981] to-[#059669]",
      glow: "shadow-[0_10px_30px_rgba(16,185,129,0.18)]",
    };
  }

  return {
    label: "Notification",
    icon: <Info className="h-[15px] w-[15px]" />,
    iconWrap:
      "bg-[linear-gradient(135deg,#eff6ff_0%,#e0f2fe_100%)] text-[#1d4ed8] border border-[#bfdbfe]",
    badge:
      "bg-[#f8fbff] text-[#1d4ed8] border border-[#dbeafe]",
    accent:
      "from-[#60a5fa] via-[#3b82f6] to-[#2563eb]",
    glow: "shadow-[0_10px_30px_rgba(59,130,246,0.18)]",
  };
}

async function ensureServiceWorkerRegistered() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register(
      "/notification-sw.js"
    );
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
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
    console.error("Notification permission error:", error);
    return "denied";
  }
}

async function showBrowserNotification(item: ToastItem) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const registration =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration()
      : null;

  const body = item.message || "You have a new notification";

  if (registration) {
    await registration.showNotification(item.title, {
      body,
      tag: String(item.id),
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: {
        url: item.url || "/super-admin",
      },
    });
    return;
  }

  const n = new Notification(item.title, {
    body,
    tag: String(item.id),
    icon: "/favicon.ico",
  });

  n.onclick = () => {
    window.focus();
    if (item.url) {
      window.location.href = item.url;
    }
  };
}

export default function DashboardNotificationToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [permission, setPermission] = useState<
    "default" | "granted" | "denied"
  >("default");
  const [permissionLoading, setPermissionLoading] = useState(false);

  const knownIdsRef = useRef<Set<string | number>>(new Set());
  const timeoutMapRef = useRef<Map<string, number>>(new Map());
  const firstLoadDoneRef = useRef(false);

  const API_BASE = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://ims-swp9.onrender.com",
    []
  );

  const removeToast = (localId: string) => {
    const timeoutId = timeoutMapRef.current.get(localId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(localId);
    }

    setToasts((prev) => prev.filter((item) => item.localId !== localId));
  };

  const openToast = (toast: ToastItem) => {
    if (toast.url) {
      window.location.href = toast.url;
      return;
    }
    window.location.href = "/dashboard";
  };

  const handleEnableNotifications = async (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      setPermissionLoading(true);

      const registration = await ensureServiceWorkerRegistered();
      const result = await askNotificationPermission();
      setPermission(result);

      if (result === "granted") {
        const testToast: ToastItem = {
          localId: `permission-${Date.now()}`,
          id: `permission-${Date.now()}`,
          title: "Notifications enabled",
          message:
            registration
              ? "Browser notifications are active now."
              : "Permission granted. Service worker is unavailable on this device/browser.",
          timeText: "Just now",
          type: "success",
          url: "/dashboard",
        };

        setToasts((prev) => [testToast, ...prev].slice(0, 4));

        const timeoutId = window.setTimeout(() => {
          removeToast(testToast.localId);
        }, 7200);

        timeoutMapRef.current.set(testToast.localId, timeoutId);
      }
    } catch (error) {
      console.error("Enable notifications failed:", error);
    } finally {
      setPermissionLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await ensureServiceWorkerRegistered();

      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
      }
    };

    init();

    return () => {
      timeoutMapRef.current.forEach((id) => window.clearTimeout(id));
      timeoutMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const token = getStoredToken();

        const res = await fetch(`${API_BASE}/sql/notifications`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) return;

        const items = normalizeNotifications(json);

        if (!firstLoadDoneRef.current) {
          items.forEach((item) => {
            if (item.id !== undefined) knownIdsRef.current.add(item.id);
          });
          firstLoadDoneRef.current = true;
          return;
        }

        const newItems = items.filter(
          (item) => item.id !== undefined && !knownIdsRef.current.has(item.id)
        );

        newItems.forEach((item) => {
          if (item.id !== undefined) knownIdsRef.current.add(item.id);
        });

        if (!mounted || !newItems.length) return;

        const prepared: ToastItem[] = newItems.slice(0, 3).map((item, index) => ({
          localId: `${item.id}-${Date.now()}-${index}`,
          id: item.id ?? `${Date.now()}-${index}`,
          title: item.title || "Notification",
          message: item.message || "You have a new notification",
          timeText: formatTime(item.createdAt),
          type: item.type || "",
          url: item.url || "/dashboard",
        }));

        setToasts((prev) => [...prepared, ...prev].slice(0, 4));

        for (const toast of prepared) {
          const timeoutId = window.setTimeout(() => {
            removeToast(toast.localId);
          }, 7200);

          timeoutMapRef.current.set(toast.localId, timeoutId);

          if (document.visibilityState !== "visible") {
            await showBrowserNotification(toast);
          }
        }
      } catch (error) {
        console.error("Fetch notifications failed:", error);
      }
    };

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [API_BASE]);

  if (!toasts.length && permission === "granted") return null;

  return (
    <>
      {permission !== "granted" && (
        <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[2147483647] flex justify-center sm:inset-x-auto sm:bottom-4 sm:left-4 sm:block">
          <div className="pointer-events-auto w-full max-w-[380px] overflow-hidden rounded-[26px] border border-white/50 bg-[rgba(255,255,255,0.94)] shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
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
                      Enable premium alerts
                    </p>
                  </div>

                  <p className="mt-1.5 text-[12px] leading-5 text-[#667085]">
                    Turn on browser notifications to receive updates outside the dashboard.
                  </p>

                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={permissionLoading}
                    className="mt-3 inline-flex min-h-[42px] w-full items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-3.5 py-2 text-[12px] font-[700] text-white shadow-[0_10px_24px_rgba(17,24,39,0.22)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {permissionLoading ? "Enabling..." : "Enable now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!toasts.length ? null : (
        <div className="pointer-events-none fixed inset-x-3 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[2147483646] flex flex-col gap-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[420px]">
          {toasts.map((toast) => {
            const meta = getNotificationMeta(
              toast.type,
              toast.title,
              toast.message
            );

            return (
              <div
                key={toast.localId}
                className={`pointer-events-auto relative overflow-hidden rounded-[28px] border border-white/50 bg-[rgba(255,255,255,0.9)] shadow-[0_28px_70px_rgba(15,23,42,0.20)] backdrop-blur-xl transition-all duration-300 ${meta.glow}`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r ${meta.accent}`}
                />

                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_70%)]" />
                <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_72%)]" />

                <div className="relative p-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`mt-0.5 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${meta.iconWrap}`}
                    >
                      {meta.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-[800] uppercase tracking-[0.08em] ${meta.badge}`}
                            >
                              {meta.label}
                            </span>

                            <span className="text-[11px] font-[600] text-[#98A2B3]">
                              {toast.timeText}
                            </span>
                          </div>

                          <p className="pr-4 text-[14px] font-[800] leading-5 text-[#111827]">
                            {toast.title}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeToast(toast.localId)}
                          className="rounded-full p-1.5 text-[#98A2B3] transition hover:bg-white/70 hover:text-[#344054]"
                          aria-label="Close notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-1.5 pr-2 text-[13px] leading-[1.55] text-[#667085]">
                        {toast.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => openToast(toast)}
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[14px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-3.5 py-2.5 text-[12px] font-[700] text-white shadow-[0_12px_30px_rgba(17,24,39,0.22)] transition active:scale-[0.99]"
                        >
                          Open
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeToast(toast.localId)}
                          className="inline-flex min-h-[40px] items-center rounded-[14px] border border-white/60 bg-white/70 px-3.5 py-2.5 text-[12px] font-[700] text-[#344054] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition active:scale-[0.99]"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative h-[3px] w-full overflow-hidden bg-[#eef2f7]/90">
                  <div
                    className={`toast-progress h-full w-full bg-gradient-to-r ${meta.accent}`}
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