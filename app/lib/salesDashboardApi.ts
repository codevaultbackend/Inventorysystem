"use client";

import axios from "axios";

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://ims-backend-nm9g.onrender.com";

const API_BASE = `${RAW_BASE.replace(/\/+$/, "")}/sales`;

export const salesDashboardApi = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

salesDashboardApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("ims_token") ||
      localStorage.getItem("imsToken") ||
      localStorage.getItem("jwt") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.headers = config.headers ?? {};
  config.headers["Content-Type"] = "application/json";

  return config;
});

export const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(toNumber(value));

export const formatCurrency = (value: number) => {
  const amount = toNumber(value);

  if (!amount) return "₹ 0";
  if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(1)} Lakhs`;

  return `₹ ${new Intl.NumberFormat("en-IN").format(amount)}`;
};

export const formatCompact = (value: number) => {
  const amount = toNumber(value);

  if (!amount) return "0";
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;

  return `${amount}`;
};

export const formatDateCell = (value: string | number | Date) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatWeekLabel = (value: string | number | Date, index: number) => {
  if (!value) return `Week ${index + 1}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `Week ${index + 1}`;

  return `Week ${index + 1}`;
};