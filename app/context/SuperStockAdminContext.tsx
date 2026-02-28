"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";

/* ================= TYPES ================= */

export type StockItem = {
  id: number;
  name: string;
  quantity: number;
  value: number;
  category: string;
  branchName: string;
  location: string;
};

export type CategoryChart = {
  category: string;
  currentStock: number;
};

export type MovementData = {
  date: string;
  stockIn: number;
  stockOut: number;
};

export type StockDashboardData = {
  totalStock: number;
  totalValue: number;
  lowStock: number;
  damagedStock: number;
  repairableStock: number;
  categoryChart: CategoryChart[];
  movementData: MovementData[];
  stockList: StockItem[];
};

type ContextType = {
  data: StockDashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const SuperStockAdminContext = createContext<ContextType | null>(null);

const BASE_URL = "https://ims-2gyk.onrender.com";

const getAuthHeader = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ================= PROVIDER ================= */

export function SuperStockAdminProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<StockDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeader();

      if (!headers) {
        setError("Authentication token missing. Please login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/stock-manager/head-dashboards`,
        { headers }
      );

      const api = res?.data;

      if (!api) {
        throw new Error("Invalid response from server");
      }

      /* ================= SAFE TRANSFORM ================= */

      const transformedData: StockDashboardData = {
        totalStock: api?.stats?.totalStock ?? 0,
        totalValue: api?.stats?.totalValue ?? 0,
        lowStock: api?.stats?.lowStock ?? 0,
        damagedStock: api?.stats?.damagedStock ?? 0,
        repairableStock: api?.stats?.repairableStock ?? 0,

        categoryChart: Array.isArray(api?.charts?.categoryChart)
          ? api.charts.categoryChart
          : [],

        movementData: Array.isArray(api?.charts?.movementData)
          ? api.charts.movementData
          : [],

        stockList: Array.isArray(api?.stocks)
          ? api.stocks.map((item: any) => ({
              id: item?.id ?? 0,
              name: item?.item ?? "",
              quantity: item?.quantity ?? 0,
              value: item?.value ?? 0,
              category: item?.category ?? "",
              branchName: item?.branch?.name ?? "",
              location: item?.branch?.location ?? "",
            }))
          : [],
      };

      setData(transformedData);
      
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard data"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockDashboard();
  }, [fetchStockDashboard]);

  return (
    <SuperStockAdminContext.Provider
      value={{
        data,
        loading,
        error,
        refresh: fetchStockDashboard,
      }}
    >
      {children}
    </SuperStockAdminContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useSuperStockAdmin() {
  const context = useContext(SuperStockAdminContext);

  if (!context) {
    throw new Error(
      "useSuperStockAdmin must be used inside SuperStockAdminProvider"
    );
  }

  return context;
}