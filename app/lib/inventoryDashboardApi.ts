"use client";

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ims-swp9.onrender.com";

function getStoredToken() {
  if (typeof window === "undefined") return null;

  const directToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt");

  if (directToken) return directToken;

  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("authUser");

    if (!rawUser) return null;

    const parsed = JSON.parse(rawUser);

    return (
      parsed?.accessToken ||
      parsed?.token ||
      parsed?.authToken ||
      parsed?.jwt ||
      null
    );
  } catch {
    return null;
  }
}

export const inventoryDashboardApi = axios.create({
  baseURL: API_BASE_URL,
});

inventoryDashboardApi.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const formatNumber = (value: unknown) => {
  return new Intl.NumberFormat("en-IN").format(toNumber(value));
};

export const formatCurrency = (value: unknown) => {
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(toNumber(value))}`;
};

export const slugifyText = (value: string) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const deslugifyText = (value: string) =>
  String(value || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default inventoryDashboardApi;