"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

/* ================= ROLE TYPE ================= */

export type Role =
  | "super_admin"
  | "admin"
  | "hr_admin"
  | "super_stock_manager"
  | "stock_manager"
  | "sales_manager"
  | "purchase_manager"
  | "finance";

/* ================= USER TYPE ================= */

interface User {
  id: string;
  email: string;
  role: Role;
  [key: string]: any;
}

/* ================= CONTEXT TYPE ================= */

type AuthContextType = {
  token: string | null;
  role: Role | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* ================= INIT FROM STORAGE ================= */

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

      const roleCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("role="))
        ?.split("=")[1] as Role | undefined;

      if (roleCookie) setRole(roleCookie);
    }

    setLoading(false);
  }, []);

  /* ================= LOGIN FUNCTION ================= */

  const login = async (email: string, password: string) => {
    const res = await axios.post(
      "https://ims-2gyk.onrender.com/sql/login",
      { email, password }
    );

    const token = res.data?.token;
    const rawRole = res.data?.user?.role;

    if (!token || !rawRole) {
      throw new Error("Invalid login response");
    }

    const normalizedRole = String(rawRole)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_") as Role;

    const loggedInUser: User = {
      ...res.data.user,
      role: normalizedRole,
    };

    // Save in state
    setToken(token);
    setRole(normalizedRole);
    setUser(loggedInUser);

    // Save in storage
    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/; SameSite=Lax`;
    document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`;

    // Redirect mapping (fully typed)
    const roleRoutes: Record<Role, string> = {
      super_admin: "/super-admin",
      admin: "/admin",
      hr_admin: "/hr-admin",
      super_stock_manager: "/stock-manager",
      stock_manager: "/stock-manager",
      sales_manager: "/sales-manager",
      purchase_manager: "/purchase-manager",
      finance: "/finance",
    };

    router.replace(roleRoutes[normalizedRole]);
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem("token");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    router.replace("/Login");
  };

  return (
    <AuthContext.Provider
      value={{ token, role, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}