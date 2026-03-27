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
import { useRouter } from "next/navigation";

export type Role =
  | "super_admin"
  | "admin"
  | "super_inventory_manager"
  | "inventory_manager"
  | "super_stock_manager"
  | "stock_manager"
  | "sales_manager"
  | "purchase_manager"
  | "super_sales_manager"
  | "finance";

interface User {
  id: string;
  email: string;
  role: Role;
  branch_id?: number;
  [key: string]: any;
}

type AuthContextType = {
  token: string | null;
  role: Role | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_ROLES: Role[] = [
  "super_admin",
  "admin",
  "super_inventory_manager",
  "inventory_manager",
  "super_sales_manager",
  "super_stock_manager",
  "stock_manager",
  "sales_manager",
  "purchase_manager",
  "finance",
];

function normalizeRole(rawRole: unknown): Role | null {
  if (!rawRole) return null;

  const normalized = String(rawRole)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_") as Role;

  return VALID_ROLES.includes(normalized) ? normalized : null;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function setAuthHeader(token: string | null) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

function getRouteByRole(role: Role | null): string {
  const roleRoutes: Record<Role, string> = {
    super_admin: "/super-admin",
    admin: "/super-admin/admin_dash",
    super_inventory_manager: "/inventory-manager",
    inventory_manager: "/inventory-manager/admin-dashboard",
    super_stock_manager: "/stock-manager",
    stock_manager: "/stock-manager",
    sales_manager: "/sales-manager/admin_dash",
    super_sales_manager: "/sales-manager",
    purchase_manager: "/purchase-manager",
    finance: "/finance",
  };

  if (!role) return "/";
  return roleRoutes[role] || "/";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const clearAuthState = useCallback(() => {
    setToken(null);
    setRole(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    if (typeof document !== "undefined") {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      document.cookie =
        "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    }

    setAuthHeader(null);
  }, []);

  const persistAuth = useCallback((newToken: string, loggedInUser: User) => {
    const normalizedRole = normalizeRole(loggedInUser.role);

    if (!normalizedRole) {
      throw new Error("Invalid user role received");
    }

    const safeUser: User = {
      ...loggedInUser,
      role: normalizedRole,
    };

    setToken(newToken);
    setRole(normalizedRole);
    setUser(safeUser);

    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(safeUser));
    }

    if (typeof document !== "undefined") {
      document.cookie = `token=${encodeURIComponent(
        newToken
      )}; path=/; SameSite=Lax`;
      document.cookie = `role=${encodeURIComponent(
        normalizedRole
      )}; path=/; SameSite=Lax`;
    }

    setAuthHeader(newToken);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        setAuthHeader(storedToken);
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          const normalizedStoredRole = normalizeRole(parsedUser?.role);

          if (normalizedStoredRole) {
            const safeUser: User = {
              ...parsedUser,
              role: normalizedStoredRole,
            };

            setUser(safeUser);
            setRole(normalizedStoredRole);
          } else {
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
        }
      } else {
        const cookieRole = normalizeRole(getCookie("role"));
        if (cookieRole) {
          setRole(cookieRole);
        }
      }

      if (!storedToken && !storedUser) {
        setAuthHeader(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await axios.post("https://ims-swp9.onrender.com/sql/login", {
        email,
        password,
      });

      const newToken = res.data?.token;
      const apiUser = res.data?.user;
      const normalizedRole = normalizeRole(apiUser?.role);

      if (!newToken || !apiUser || !normalizedRole) {
        throw new Error("Invalid login response");
      }

      const loggedInUser: User = {
        ...apiUser,
        role: normalizedRole,
      };

      persistAuth(newToken, loggedInUser);

      router.replace(getRouteByRole(normalizedRole));
    },
    [persistAuth, router]
  );

  const logout = useCallback(() => {
    clearAuthState();
    router.replace("/Login");
  }, [clearAuthState, router]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        login,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}