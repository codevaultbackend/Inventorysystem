"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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

function getStoredToken() {
  if (typeof window === "undefined") return null;

  const directToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt");

  if (directToken) return directToken;

  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("authUser");

    if (!rawUser) return null;

    const parsed = JSON.parse(rawUser);

    return (
      parsed?.accessToken ||
      parsed?.token ||
      parsed?.authToken ||
      parsed?.jwt ||
      null
    );
  } catch {
    return null;
  }
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("authUser");

    if (!rawUser) return null;

    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function toNumber(value: any) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function toArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function extractApiPayload(data: any) {
  if (!data) return null;

  return data?.dashboard || data?.data || data?.result || data?.payload || data;
}

function normalizeDashboard(payload: any) {
  const root = payload || {};

  const stateRows =
    toArray(root?.states).length > 0
      ? root.states
      : toArray(root?.stateBreakdown).length > 0
      ? root.stateBreakdown
      : toArray(root?.branchHierarchy).length > 0
      ? root.branchHierarchy
      : toArray(root?.branches).length > 0
      ? root.branches
      : Array.isArray(root)
      ? root
      : [];

  const cards = root?.cards || root?.stats || root?.summary || {};
  const agingChart = root?.agingChart || root?.aging || root?.stockStatus || {};

  const purchaseChart =
    toArray(root?.purchaseChart).length > 0
      ? root.purchaseChart
      : toArray(root?.purchaseData).length > 0
      ? root.purchaseData
      : toArray(root?.monthlyPurchase).length > 0
      ? root.monthlyPurchase
      : [];

  const inventoryTable =
    toArray(root?.inventoryTable).length > 0
      ? root.inventoryTable
      : toArray(root?.tableData).length > 0
      ? root.tableData
      : toArray(root?.inventory).length > 0
      ? root.inventory
      : toArray(root?.items).length > 0
      ? root.items
      : toArray(root?.allItems).length > 0
      ? root.allItems
      : [];

  const fallbackCards = {
    totalStockItems:
      toNumber(cards?.totalStockItems) ||
      toNumber(cards?.totalItems) ||
      stateRows.reduce(
        (sum: number, item: any) =>
          sum +
          toNumber(
            item?.totalStockItems ??
              item?.stockItems ??
              item?.stock ??
              item?.totalStock
          ),
        0
      ),

    transitItems:
      toNumber(cards?.transitItems) ||
      stateRows.reduce(
        (sum: number, item: any) =>
          sum +
          toNumber(
            item?.transitItems ??
              item?.inTransit ??
              item?.transit ??
              item?.stockInTransit
          ),
        0
      ),
  };

  const fallbackAging = {
    available:
      toNumber(agingChart?.available) ||
      stateRows.reduce(
        (sum: number, item: any) =>
          sum + toNumber(item?.available ?? item?.good ?? item?.currentStock),
        0
      ),
    damaged:
      toNumber(agingChart?.damaged) ||
      stateRows.reduce(
        (sum: number, item: any) => sum + toNumber(item?.damaged),
        0
      ),
    repairable:
      toNumber(agingChart?.repairable) ||
      stateRows.reduce(
        (sum: number, item: any) => sum + toNumber(item?.repairable),
        0
      ),
  };

  const fallbackPurchaseChart =
    purchaseChart.length > 0
      ? purchaseChart
      : stateRows.map((item: any, index: number) => ({
          month:
            item?.state ||
            item?.name ||
            item?.month ||
            item?.label ||
            item?.branchName ||
            `Row ${index + 1}`,
          amount: toNumber(
            item?.purchase ??
              item?.purchaseAmount ??
              item?.stockIn ??
              item?.totalPurchase
          ),
        }));

  const fallbackInventoryTable =
    inventoryTable.length > 0
      ? inventoryTable
      : stateRows.map((item: any, index: number) => ({
          id: item?.id ?? index + 1,
          itemName:
            item?.itemName || item?.name || item?.state || item?.branchName || "NA",
          categories: item?.categories || item?.category || "NA",
          hsnCode: item?.hsnCode || "-",
          grnNo: item?.grnNo || "-",
          poNumber: item?.poNumber || "-",
          currentStock: toNumber(
            item?.currentStock ?? item?.stock ?? item?.stockItems
          ),
          stockIn: toNumber(item?.stockIn ?? item?.purchase),
          stockOut: toNumber(item?.stockOut ?? item?.sale),
          scrap: toNumber(item?.scrap),
          dispatchDate: item?.dispatchDate || "-",
          deliveryDate: item?.deliveryDate || "-",
          status: item?.status || "GOOD",
        }));

  return {
    ...root,
    cards: {
      ...cards,
      ...fallbackCards,
    },
    agingChart: {
      ...agingChart,
      ...fallbackAging,
    },
    purchaseChart: fallbackPurchaseChart,
    inventoryTable: fallbackInventoryTable,
    states: stateRows,
    stateBreakdown: stateRows,
    branchHierarchy: stateRows,
  };
}

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

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getStoredToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const storedUser = getStoredUser();
      const role = String(storedUser?.role || "").toLowerCase().trim();
      const branchId =
        storedUser?.branch_id ??
        storedUser?.branchId ??
        storedUser?.branch?.id ??
        storedUser?.branch?.branch_id;

      let endpoint = `${baseUrl}/combine/dashboard/states`;

      // keep super_inventory_manager same as current behavior
      if (role === "inventory_manager") {
        if (!branchId) {
          throw new Error("Branch ID not found for inventory manager");
        }

        endpoint = `${baseUrl}/dashboard/branch-id/${encodeURIComponent(
          String(branchId)
        )}`;
      }

      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rawPayload = extractApiPayload(res.data);
      const normalized = normalizeDashboard(rawPayload);

      setDashboard(normalized);

      console.log("INVENTORY ROLE =>", role);
      console.log("BRANCH ID =>", branchId);
      console.log("FETCH ENDPOINT =>", endpoint);
      console.log("RAW API RESPONSE =>", res.data);
      console.log("NORMALIZED DASHBOARD =>", normalized);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load inventory dashboard";

      setError(message);

      if (err?.response?.status === 401) {
        localStorage.clear();
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [baseUrl, router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
    throw new Error("useApp must be used inside InventoryManagerDashboard");
  }

  return context;
}