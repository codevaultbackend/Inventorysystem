"use client";

import axios from "axios";

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://ims-swp9.onrender.com";

const API_BASE = `${RAW_BASE.replace(/\/+$/, "")}/sales`;

export const salesDashboardApi = axios.create({
  baseURL: API_BASE,
});

salesDashboardApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("ims_token") ||
      localStorage.getItem("imsToken") ||
      localStorage.getItem("jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

export const formatCurrency = (value: number) => {
  if (!value) return "₹ 0";

  if (value >= 10000000) return `₹ ${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹ ${(value / 100000).toFixed(1)} Lakhs`;

  return `₹ ${new Intl.NumberFormat("en-IN").format(value)}`;
};

export const formatCompact = (value: number) => {
  if (!value) return "0";
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
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

export const formatWeekLabel = (_value: string | number | Date, index: number) =>
  `Week ${index + 1}`;