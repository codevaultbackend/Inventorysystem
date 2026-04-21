// lib/recentActivities.ts
export type RecentActivityApiItem = {
  id: number | string;
  user_id?: number | null;
  branch_id?: number | null;
  action?: string | null;
  details?: string | null;
  ref_id?: number | null;
  ref_type?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RecentActivityUiItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "success" | "warning" | "security" | "inventory" | "sales" | "system";
  action: string;
  createdAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ims-backend-nm9g.onrender.com";

function getAuthToken() {
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

function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return "Just now";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `${mins} min ago`;
  }
  if (diffMs < day) {
    const hrs = Math.floor(diffMs / hour);
    return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  }
  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function prettifyAction(action?: string | null) {
  if (!action) return "System Activity";

  const normalized = action.replaceAll("_", " ").toLowerCase();

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getActivityType(
  action?: string | null,
  refType?: string | null
): RecentActivityUiItem["type"] {
  const actionValue = (action || "").toLowerCase();
  const refTypeValue = (refType || "").toLowerCase();

  if (
    actionValue.includes("sale") ||
    actionValue.includes("payment") ||
    actionValue.includes("transaction")
  ) {
    return "sales";
  }

  if (
    actionValue.includes("stock") ||
    actionValue.includes("inventory") ||
    refTypeValue.includes("inventory")
  ) {
    return "inventory";
  }

  if (
    actionValue.includes("password") ||
    actionValue.includes("login") ||
    actionValue.includes("otp") ||
    refTypeValue.includes("password_reset")
  ) {
    return "security";
  }

  if (actionValue.includes("warning") || actionValue.includes("alert")) {
    return "warning";
  }

  if (actionValue.includes("success") || actionValue.includes("completed")) {
    return "success";
  }

  return "system";
}

export function mapRecentActivity(
  item: RecentActivityApiItem
): RecentActivityUiItem {
  return {
    id: String(item.id),
    title:
      item.title?.trim() ||
      prettifyAction(item.action) ||
      "System Activity",
    description:
      item.description?.trim() ||
      item.details?.trim() ||
      "No details available",
    time: formatRelativeTime(item.createdAt),
    type: getActivityType(item.action, item.ref_type),
    action: item.action || "",
    createdAt: item.createdAt || "",
  };
}

export async function fetchRecentActivities(): Promise<RecentActivityUiItem[]> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/sql/recent-activities`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch recent activities");
  }

  const json = await res.json();

  const list = Array.isArray(json?.data) ? json.data : [];

  return list.map(mapRecentActivity);
}