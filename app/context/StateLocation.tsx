"use client";

import { createContext, useContext, useEffect, useState } from "react";

const StateLocationsContext = createContext<any>(null);

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isStockRole(role?: string) {
  const r = String(role || "").toLowerCase();
  return (
    r === "super_stock_manager" ||
    r === "stock_manager" ||
    r === "super_inventory_manager" ||
    r === "inventory_manager" ||
    r === "super_admin" ||
    r === "admin"
  );
}

export function StateLocationProvider({ children }: { children: React.ReactNode }) {
  const [stateLocation, setStateLocation] = useState<any[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [stateError, setStateError] = useState("");

  const fetchLocations = async () => {
    const user = getStoredUser();

    if (!isStockRole(user?.role)) {
      setStateLocation([]);
      setStateLoading(false);
      setStateError("");
      return;
    }

    try {
      setStateLoading(true);
      setStateError("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(
        "https://ims-swp9.onrender.com/stock-manager/state",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error: ${res.status} ${text}`);
      }

      const data = await res.json();
      setStateLocation(Array.isArray(data) ? data : data?.data || []);
    } catch (err: any) {
      console.error(err);
      setStateError(err?.message || "Failed to fetch locations");
      setStateLocation([]);
    } finally {
      setStateLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <StateLocationsContext.Provider
      value={{
        stateLocation,
        stateLoading,
        stateError,
        refreshStateLocations: fetchLocations,
      }}
    >
      {children}
    </StateLocationsContext.Provider>
  );
}

export function useStateLocations() {
  return useContext(StateLocationsContext);
}