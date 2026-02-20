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

type Stats = {
  totalUsers: number;
  totalStock: number;
  totalBranches: number;
  totalStockValue: number;
};

type Branch = {
  id: number;
  name: string;
  stock_items?: string;
  stock_value?: number;
};

type DashboardData = {
  stats: Stats;
  branchOverview: Branch[];
};

type UserData = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type ContextType = {
  data: DashboardData | null;
  users: UserData[] | null;
  branches: Branch[] | null;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => void;
};

/* ================= CONTEXT ================= */

const SuperDashboardContext = createContext<ContextType | null>(null);

/* ================= HELPERS ================= */

const BASE_URL =
  "https://c42c-2401-4900-8840-ecd4-5df8-9d37-79eb-ef55.ngrok-free.app";

const getAuthHeader = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true",
  };
};

/* ================= PROVIDER ================= */

export function SuperDashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<UserData[] | null>(null);
  const [branches, setBranches] = useState<Branch[] | null>(null);

  const [location, setLocation] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH DASHBOARD ================= */

  const fetchDashboard = useCallback(async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) {
        setError("No auth token found");
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/sqlbranch/super-dashboard`,
        { headers }
      );

      setData(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load dashboard"
      );
    }
  }, []);

  /* ================= FETCH BY LOCATION ================= */

  const fetchByLocation = useCallback(async () => {
    if (!location) return;

    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/sqlbranch/location/${location}`,
        { headers }
      );

      setData(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load location data"
      );
    }
  }, [location]);

  /* ================= FETCH USERS ================= */

  const fetchUsers = useCallback(async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/sqlbranch/d/get-users`,
        { headers }
      );

      setUsers(res.data);
    } catch {
      setError("Failed to fetch users");
    }
  }, []);

  /* ================= FETCH BRANCHES ================= */

  const fetchBranches = useCallback(async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/sqlbranch/branches`,
        { headers }
      );

      setBranches(res.data?.branches || []);
    } catch {
      setError("Failed to fetch branches");
    }
  }, []);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      await Promise.all([
        fetchDashboard(),
        fetchUsers(),
        fetchBranches(),
      ]);

      setLoading(false);
    };

    loadAll();
  }, [fetchDashboard, fetchUsers, fetchBranches]);

  /* ================= LOCATION CHANGE EFFECT ================= */

  useEffect(() => {
    fetchByLocation();
  }, [fetchByLocation]);

  /* ================= PROVIDER ================= */

  return (
    <SuperDashboardContext.Provider
      value={{
        data,
        users,
        branches,
        location,
        setLocation,
        loading,
        error,
        refreshDashboard: fetchDashboard,
      }}
    >
      {children}
    </SuperDashboardContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useSuperDashboard() {
  const context = useContext(SuperDashboardContext);

  if (!context) {
    throw new Error("useSuperDashboard must be used inside provider");
  }

  return context;
}
