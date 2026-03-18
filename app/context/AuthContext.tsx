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


export type Role =
  | "super_admin"
  | "admin"
  | "super_inventory_manager"
  | "hr_admin"
  | "super_stock_manager"
  | "stock_manager"
  | "sales_manager"
  | "purchase_manager"
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
};

const AuthContext = createContext<AuthContextType | null>(null);



function normalizeRole(rawRole: string): Role {
  return String(rawRole)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_") as Role;
}



export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    } else {
      const roleCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("role="))
        ?.split("=")[1] as Role | undefined;

      if (roleCookie) {
        setRole(roleCookie);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post("https://ims-2gyk.onrender.com/sql/login", {
      email,
      password,
    });

    const newToken = res.data?.token;
    const rawRole = res.data?.user?.role;

    if (!newToken || !rawRole) {
      throw new Error("Invalid login response");
    }

    const normalizedRole = normalizeRole(rawRole);

    const loggedInUser: User = {
      ...res.data.user,
      role: normalizedRole,
    };

    setToken(newToken);
    setRole(normalizedRole);
    setUser(loggedInUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    document.cookie = `token=${newToken}; path=/; SameSite=Lax`;
    document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`;

    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    const roleRoutes: Record<Role, string> = {
      super_admin: "/super-admin",
      admin: "/branch-manager",
      hr_admin: "/hr-admin",
      super_stock_manager: "/stock-manager",
      stock_manager: "/stock-manager",
      sales_manager: "/sales-manager",
      inventory_manager: "/inventory-manager",
      purchase_manager: "/purchase-manager",
      finance: "/finance",
    };

    router.replace(roleRoutes[normalizedRole]);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    delete axios.defaults.headers.common["Authorization"];

    router.replace("/Login");
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, loading }}>
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