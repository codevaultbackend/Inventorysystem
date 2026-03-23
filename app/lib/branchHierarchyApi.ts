"use client";

import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://ims-2gyk.onrender.com";

export const hierarchyApi = axios.create({
  baseURL: API_BASE,
});

hierarchyApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const parseCompactNumber = (
  value: number | string | undefined | null
) => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const str = String(value)
    .trim()
    .toUpperCase()
    .replace(/₹/g, "")
    .replace(/,/g, "");

  if (str.endsWith("K")) return Math.round(parseFloat(str.replace("K", "")) * 1000);
  if (str.endsWith("M")) return Math.round(parseFloat(str.replace("M", "")) * 1000000);
  if (str.endsWith("L")) return Math.round(parseFloat(str.replace("L", "")) * 100000);
  if (str.endsWith("CR")) return Math.round(parseFloat(str.replace("CR", "")) * 10000000);

  const numeric = Number(str);
  return Number.isNaN(numeric) ? 0 : numeric;
};

export const formatDateToWeekLabel = (_dateString: string, index: number) => {
  return `Week ${index + 1}`;
};