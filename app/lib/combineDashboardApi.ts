"use client";

import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://ims-backend-nm9g.onrender.com";

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const directToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("refreshToken");

  if (directToken) return directToken;

  const possibleObjects = [
    localStorage.getItem("user"),
    localStorage.getItem("authUser"),
    localStorage.getItem("auth"),
  ];

  for (const item of possibleObjects) {
    if (!item) continue;

    try {
      const parsed = JSON.parse(item);

      const nestedToken =
        parsed?.accessToken ||
        parsed?.token ||
        parsed?.authToken ||
        parsed?.jwt ||
        parsed?.data?.accessToken ||
        parsed?.data?.token;

      if (nestedToken) return nestedToken;
    } catch {
      //
    }
  }

  return null;
};

export const combineApi = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

combineApi.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

combineApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    return Promise.reject(error);
  }
);

export const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const extractApiData = <T = any>(response: any): T => {
  return (
    response?.data?.data ??
    response?.data?.result ??
    response?.data?.payload ??
    response?.data ??
    null
  );
};

export const extractApiArray = <T = any>(response: any): T[] => {
  const payload = extractApiData<any>(response);

  const possibleArrays = [
    payload,
    payload?.data,
    payload?.items,
    payload?.rows,
    payload?.inventory,
    payload?.topItems,
    payload?.allItems,
    payload?.stockItems,
    payload?.branchItems,
    payload?.inventoryItems,

    payload?.branch?.items,
    payload?.branch?.rows,
    payload?.branch?.inventory,
    payload?.branch?.topItems,
    payload?.branch?.allItems,
    payload?.branch?.stockItems,
    payload?.branch?.branchItems,
    payload?.branch?.inventoryItems,

    payload?.data?.items,
    payload?.data?.rows,
    payload?.data?.inventory,
    payload?.data?.topItems,
    payload?.data?.allItems,
    payload?.data?.stockItems,
    payload?.data?.branchItems,
    payload?.data?.inventoryItems,

    payload?.data?.branch?.items,
    payload?.data?.branch?.rows,
    payload?.data?.branch?.inventory,
    payload?.data?.branch?.topItems,
    payload?.data?.branch?.allItems,
    payload?.data?.branch?.stockItems,
    payload?.data?.branch?.branchItems,
    payload?.data?.branch?.inventoryItems,
  ];

  for (const arr of possibleArrays) {
    if (Array.isArray(arr)) return arr;
  }

  return [];
};