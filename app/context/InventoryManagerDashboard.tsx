"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

type AppContextType = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dashboard: any;
  loading: boolean;
  error: string;
  fetchDashboard: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function InventoryManagerDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("token")
          : null;

      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await axios.get(
        "https://ims-2gyk.onrender.com/combine/dashboard/inventory",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success && res.data?.dashboard) {
        setDashboard(res.data.dashboard);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");

      if (err?.response?.status === 401) {
        localStorage.clear();
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <AppContext.Provider
      value={{
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
        dashboard,
        loading,
        error,
        fetchDashboard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside InventoryManagerDashboard"
    );
  }

  return context;
}