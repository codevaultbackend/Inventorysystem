"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

/* ================= TYPES ================= */

type Stats = {
  totalUsers: number;
  totalStock: number;
  totalBranches: number;
  totalStockValue: number;
};

type SalesAnalyticsItem = {
  date: string;
  total: number;
};

type StockDistributionItem = {
  category: string;
  total: number;
  percentage: string | number;
};

type BranchOverviewItem = {
  id?: number;
  branchName?: string;
  name?: string;
  stockItems?: number | string;
  purchase?: number | string;
  sale?: number | string;
  stockIn?: number | string;
  stockOut?: number | string;
};

type RecentActivityItem = {
  title?: string;
  description?: string;
  time?: string;
  type?: string;
};

type DashboardData = {
  stats: Stats;
  salesAnalytics: {
    sales: SalesAnalyticsItem[];
    purchase: SalesAnalyticsItem[];
  };
  stockDistribution: StockDistributionItem[];
  branchOverview: BranchOverviewItem[];
  recentActivities: RecentActivityItem[];
};

type UserData = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type Branch = {
  id: number;
  name: string;
  code?: string;
  state?: string;
  type?: string;
  status?: string;
  location?: string;
  contact_number?: string | null;
  email?: string | null;
  stock_items?: string | number;
  stock_value?: number;
};

type ContextType = {
  data: DashboardData;
  users: UserData[];
  branches: Branch[];
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const SuperDashboardContext = createContext<ContextType | null>(null);

/* ================= CONFIG ================= */

const ALLOWED_ROLES = ["super_admin", "admin"];

/* ================= EMPTY STATE ================= */

const emptyDashboard: DashboardData = {
  stats: {
    totalUsers: 0,
    totalStock: 0,
    totalBranches: 0,
    totalStockValue: 0,
  },
  salesAnalytics: {
    sales: [],
    purchase: [],
  },
  stockDistribution: [],
  branchOverview: [],
  recentActivities: [],
};

/* ================= HELPERS ================= */

const getStoredToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token") || localStorage.getItem("accessToken")
    : null;

const getAuthHeader = () => {
  const token = getStoredToken();
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
};

const getUserBranchId = (user: any): number | null => {
  if (!user) return null;

  if (Array.isArray(user.branches) && user.branches.length > 0) {
    return Number(user.branches[0]);
  }

  if (user.branch_id !== undefined && user.branch_id !== null) {
    return Number(user.branch_id);
  }

  return null;
};

const normalizeDashboard = (
  payload: any,
  isBranchUser = false
): DashboardData => {
  const stats: Stats = {
    totalUsers: Number(payload?.stats?.totalUsers ?? payload?.totalUsers ?? 0),
    totalStock: Number(payload?.stats?.totalStock ?? payload?.totalStock ?? 0),
    totalBranches: Number(
      payload?.stats?.totalBranches ??
        payload?.totalBranches ??
        (isBranchUser ? 1 : 0)
    ),
    totalStockValue: Number(
      payload?.stats?.totalStockValue ?? payload?.totalStockValue ?? 0
    ),
  };

  return {
    stats,
    salesAnalytics: {
      sales: Array.isArray(payload?.salesAnalytics?.sales)
        ? payload.salesAnalytics.sales
        : [],
      purchase: Array.isArray(payload?.salesAnalytics?.purchase)
        ? payload.salesAnalytics.purchase
        : [],
    },
    stockDistribution: Array.isArray(payload?.stockDistribution)
      ? payload.stockDistribution
      : [],
    branchOverview: Array.isArray(payload?.branchOverview)
      ? payload.branchOverview
      : Array.isArray(payload?.branches)
      ? payload.branches
      : [],
    recentActivities: Array.isArray(payload?.recentActivities)
      ? payload.recentActivities
      : [],
  };
};

const normalizeUsers = (payload: any): UserData[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

const normalizeBranches = (payload: any): Branch[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.branches)) return payload.branches;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

/* ================= PROVIDER ================= */

export function SuperDashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading: authLoading, token } = useAuth();

  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [users, setUsers] = useState<UserData[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branchId = useMemo(() => getUserBranchId(user), [user]);

  const isAllowedRole = useMemo(() => {
    return !!user?.role && ALLOWED_ROLES.includes(user.role);
  }, [user?.role]);

  const isSuperAdmin = useMemo(() => user?.role === "super_admin", [user?.role]);

  const clearState = useCallback(() => {
    setData(emptyDashboard);
    setUsers([]);
    setBranches([]);
    setLocation("");
    setError(null);
  }, []);

  const getDashboardEndpoint = useCallback(() => {
      return "/api/sqlbranch/super-dashboard";
  }, [user?.role, branchId]);

  const fetchDashboard = useCallback(async () => {
    if (!user || !isAllowedRole) return;

    const headers = getAuthHeader();
    if (!headers) {
      setError("Authentication token not found");
      return;
    }

    const endpoint = getDashboardEndpoint();
    if (!endpoint) {
      setError("Dashboard endpoint not found");
      return;
    }

    try {
      const res = await axios.get(endpoint, { headers });
      const dashboardData = normalizeDashboard(res.data, !isSuperAdmin);
      setData(dashboardData);
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError("You are not authorized to view this dashboard");
        return;
      }

      setError(err?.response?.data?.message || "Failed to load dashboard");
    }
  }, [user, isAllowedRole, getDashboardEndpoint, isSuperAdmin]);

  const fetchUsers = useCallback(async () => {
    if (!user || !isAllowedRole) return;

    if (!isSuperAdmin) {
      setUsers([]);
      return;
    }

    const headers = getAuthHeader();
    if (!headers) {
      setError("Authentication token not found");
      return;
    }

    try {
      const res = await axios.get("/api/sqlbranch/get-users", { headers });
      setUsers(normalizeUsers(res.data));
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) return;
      setError(
        (prev) => prev || err?.response?.data?.message || "Failed to fetch users"
      );
    }
  }, [user, isAllowedRole, isSuperAdmin]);



  const fetchByLocation = useCallback(async () => {
    if (!user || !isAllowedRole || !location) return;
    if (!isSuperAdmin) return;

    const headers = getAuthHeader();
    if (!headers) {
      setError("Authentication token not found");
      return;
    }

    try {
      const res = await axios.get(
        `/api/sqlbranch/location/${encodeURIComponent(location)}`,
        { headers }
      );

      const dashboardData = normalizeDashboard(res.data, false);
      setData(dashboardData);
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) return;
      setError(
        (prev) =>
          prev || err?.response?.data?.message || "Failed to load location data"
      );
    }
  }, [user, isAllowedRole, location, isSuperAdmin]);


  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user || !token) {
      clearState();
      setLoading(false);
      return;
    }

    if (!isAllowedRole) {
      clearState();
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchDashboard(), fetchUsers(), ]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [
    authLoading,
    user,
    token,
    isAllowedRole,
    fetchDashboard,
    fetchUsers,
    clearState,
  ]);

  /* ================= LOCATION CHANGE ================= */

  useEffect(() => {
    if (authLoading || !user || !token || !isAllowedRole || !location) return;
    fetchByLocation();
  }, [authLoading, user, token, isAllowedRole, location, fetchByLocation]);

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