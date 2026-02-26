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



type AuthContextType = {
  token: string | null;
  role: string | null;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};



const AuthContext = createContext<AuthContextType | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
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
        ?.split("=")[1];

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
      .replace(/-/g, "_");

    // Save in state
    setToken(token);
    setRole(normalizedRole);
    setUser(res.data.user);

    // Save in storage
    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/; SameSite=Lax`;
    document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`;

    // Redirect mapping
    const roleRoutes: Record<string, string> = {
      super_admin: "/super-admin",
      admin: "/admin",
      hr_admin: "/hr-admin",
      super_stock_manager: "/stock-manager",
      stock_manager: "/stock-manager",
      sales_manager: "/sales-manager",
      purchase_manager: "/purchase-manager",
      finance: "/finance",
    };

    router.replace(roleRoutes[normalizedRole] || "/unauthorized");
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
  if (!context)
    throw new Error("useAuth must be used inside AuthProvider");
  return context;
}