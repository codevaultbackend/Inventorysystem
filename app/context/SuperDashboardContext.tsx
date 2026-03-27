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
  phone?: string;
  role?: string;
  profile?: string;
  branch?: string;
  status?: "Active" | "Inactive";
  lastLogin?: string;
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
    ? localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken")
    : null;

const getAuthHeader = () => {
  const token = getStoredToken();
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const getUserBranchId = (user: any): number | null => {
  if (!user) return null;

  if (Array.isArray(user.branches) && user.branches.length > 0) {
    const firstBranch = Number(user.branches[0]);
    return Number.isNaN(firstBranch) ? null : firstBranch;
  }

  if (user.branch_id !== undefined && user.branch_id !== null) {
    const parsed = Number(user.branch_id);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (user.branchId !== undefined && user.branchId !== null) {
    const parsed = Number(user.branchId);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const normalizeDashboard = (
  payload: any,
  isBranchUser = false
): DashboardData => {
  const raw = payload?.data ?? payload;

  const stats: Stats = {
    totalUsers: toNumber(raw?.stats?.totalUsers ?? raw?.totalUsers),
    totalStock: toNumber(raw?.stats?.totalStock ?? raw?.totalStock),
    totalBranches: toNumber(
      raw?.stats?.totalBranches ?? raw?.totalBranches ?? (isBranchUser ? 1 : 0)
    ),
    totalStockValue: toNumber(
      raw?.stats?.totalStockValue ?? raw?.totalStockValue
    ),
  };

  return {
    stats,
    salesAnalytics: {
      sales: Array.isArray(raw?.salesAnalytics?.sales)
        ? raw.salesAnalytics.sales
        : [],
      purchase: Array.isArray(raw?.salesAnalytics?.purchase)
        ? raw.salesAnalytics.purchase
        : [],
    },
    stockDistribution: Array.isArray(raw?.stockDistribution)
      ? raw.stockDistribution
      : [],
    branchOverview: Array.isArray(raw?.branchOverview)
      ? raw.branchOverview
      : Array.isArray(raw?.branches)
      ? raw.branches
      : [],
    recentActivities: Array.isArray(raw?.recentActivities)
      ? raw.recentActivities
      : Array.isArray(raw?.recentActivity)
      ? raw.recentActivity
      : [],
  };
};

const normalizeUsers = (payload: any): UserData[] => {
  const rawUsers = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.users)
    ? payload.users
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return rawUsers.map((user: any, index: number) => ({
    id: Number(user?.id ?? index + 1),
    name: String(user?.name ?? user?.fullName ?? "Unknown User"),
    email: String(user?.email ?? ""),
    phone: user?.phone ?? user?.contact_number ?? "",
    role: String(user?.role ?? ""),
    profile: user?.profile ?? user?.designation ?? "",
    branch:
      user?.branch ??
      user?.branchName ??
      user?.branch_name ??
      user?.location ??
      "",
    status:
      user?.status === "Inactive" || user?.status === "inactive"
        ? "Inactive"
        : "Active",
    lastLogin: user?.lastLogin ?? user?.last_login ?? "",
  }));
};

const normalizeBranches = (payload: any): Branch[] => {
  const rawBranches = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.branches)
    ? payload.branches
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return rawBranches.map((branch: any, index: number) => ({
    id: Number(branch?.id ?? index + 1),
    name: String(branch?.name ?? branch?.branchName ?? "Unknown Branch"),
    code: branch?.code ?? "",
    state: branch?.state ?? "",
    type: branch?.type ?? "",
    status: branch?.status ?? "",
    location: branch?.location ?? "",
    contact_number: branch?.contact_number ?? null,
    email: branch?.email ?? null,
    stock_items: branch?.stock_items ?? branch?.stockItems ?? 0,
    stock_value: toNumber(branch?.stock_value ?? branch?.stockValue ?? 0),
  }));
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
    if (isSuperAdmin) {
      return "/api/sqlbranch/super-dashboard";
    }

    if (user?.role === "admin" && branchId) {
      return `/api/sqlbranch/branch/${branchId}`;
    }

    return null;
  }, [isSuperAdmin, user?.role, branchId]);

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

    const headers = getAuthHeader();
    if (!headers) {
      setError("Authentication token not found");
      return;
    }

    try {
      const res = await axios.get("/api/sqlbranch/get-users", { headers });
      setUsers(normalizeUsers(res.data));
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setUsers([]);
        return;
      }

      setError(
        (prev) => prev || err?.response?.data?.message || "Failed to fetch users"
      );
    }
  }, [user, isAllowedRole, isSuperAdmin]);

  const fetchBranches = useCallback(async () => {
    if (!user || !isAllowedRole) return;

    const headers = getAuthHeader();
    if (!headers) {
      setError("Authentication token not found");
      return;
    }

    if (!isSuperAdmin) {
      setBranches([]);
      return;
    }

    try {
      const res = await axios.get("/api/sqlbranch/branches", { headers });
      setBranches(normalizeBranches(res.data));
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setBranches([]);
        return;
      }

      setError(
        (prev) =>
          prev || err?.response?.data?.message || "Failed to fetch branches"
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

  const refreshDashboard = useCallback(async () => {
    if (!user || !token || !isAllowedRole) return;

    setLoading(true);
    setError(null);

    try {
      if (location && isSuperAdmin) {
        await Promise.all([fetchByLocation(), fetchUsers(), fetchBranches()]);
      } else {
        await Promise.all([fetchDashboard(), fetchUsers(), fetchBranches()]);
      }
    } finally {
      setLoading(false);
    }
  }, [
    user,
    token,
    isAllowedRole,
    location,
    isSuperAdmin,
    fetchByLocation,
    fetchDashboard,
    fetchUsers,
    fetchBranches,
  ]);

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

    refreshDashboard();
  }, [authLoading, user, token, isAllowedRole, clearState, refreshDashboard]);

  /* ================= LOCATION CHANGE ================= */

  useEffect(() => {
    if (authLoading || !user || !token || !isAllowedRole) return;

    if (!location) {
      fetchDashboard();
      return;
    }

    fetchByLocation();
  }, [
    authLoading,
    user,
    token,
    isAllowedRole,
    location,
    fetchDashboard,
    fetchByLocation,
  ]);

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
        refreshDashboard,
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