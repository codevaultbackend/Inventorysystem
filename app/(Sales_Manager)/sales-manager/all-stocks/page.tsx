"use client";

import { useEffect, useMemo, useState } from "react";
import InventoryItems from "../Branches/Component/InventoryItems";
import { combineApi, toNumber } from "../../../lib/combineDashboardApi";
import { useAuth } from "../../../context/AuthContext";

type BranchApiResponse = {
  branchUsed?: number;
  branchInfo?: {
    id?: number | string;
    name?: string;
    code?: string;
    state?: string;
    type?: string;
    status?: string;
    location?: string;
    contact_number?: string;
    email?: string;
  };
  stats?: {
    totalStock?: number | string;
    totalValue?: number | string;
    totalSales?: number | string;
    agingItems?: number | string;
  };
  charts?: {
    stockMovement?: Array<{
      week?: string;
      stockIn?: number | string;
      stockOut?: number | string;
    }>;
    salesTrend?: Array<{
      week?: string;
      stockIn?: number | string;
      stockOut?: number | string;
    }>;
  };
  stocks?: Array<{
    id?: number | string;
    item?: string;
    category?: string;
    quantity?: number | string;
    current_stock?: number | string;
    stock_in?: number | string;
    stock_out?: number | string;
    status?: string;
    value?: number | string;
    aging?: number | string;
    branch_id?: number | string;
  }>;
};

type InventoryRow = {
  id: string;
  itemName: string;
  name: string;
  category: string;
  quantity: number;
  stock: number;
  stockIn: number;
  stockOut: number;
  status: string;
  href: string;
};

function getUserBranchId(user: any): string {
  if (!user) return "";

  if (Array.isArray(user?.branches) && user.branches.length > 0) {
    return String(user.branches[0] ?? "");
  }

  if (user?.branch_id !== undefined && user?.branch_id !== null) {
    return String(user.branch_id);
  }

  if (user?.branchId !== undefined && user?.branchId !== null) {
    return String(user.branchId);
  }

  return "";
}

export default function AllStocksPage() {
  const {
    user,
    branchName: authBranchName,
    stateName: authStateName,
  } = useAuth();

  const branchId = getUserBranchId(user);

  const [data, setData] = useState<BranchApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranchStocks = async () => {
      if (!branchId) {
        setError("Branch ID not found in logged in user");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await combineApi.get(
          `/sqlbranch/branch/${encodeURIComponent(branchId)}`
        );

        const payload = (res?.data || {}) as BranchApiResponse;
        setData(payload);
      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 403) {
          setError("You are not authorized to view this branch.");
        } else if (status === 404) {
          setError("Branch details endpoint was not found.");
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load branch details"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBranchStocks();
  }, [branchId]);

  const branchDisplayName =
    data?.branchInfo?.name || authBranchName || "My Branch";

  const stateDisplayName = data?.branchInfo?.state || authStateName || "";

  const itemRows: InventoryRow[] = useMemo(() => {
    const stocks = Array.isArray(data?.stocks) ? data.stocks : [];

    return stocks.map((item) => {
      const id = String(item?.id ?? "");
      const query = new URLSearchParams({
        branchId: String(branchId || item?.branch_id || ""),
        state: String(stateDisplayName || ""),
        branchName: String(branchDisplayName || ""),
      }).toString();

      return {
        id,
        itemName: item?.item || "-",
        name: item?.item || "-",
        category: item?.category || "General",
        quantity: toNumber(item?.quantity ?? item?.current_stock),
        stock: toNumber(item?.quantity ?? item?.current_stock),
        stockIn: toNumber(item?.stock_in),
        stockOut: toNumber(item?.stock_out),
        status: item?.status || "-",
        href: `/super-admin/all-stocks/${encodeURIComponent(id)}?${query}`,
      };
    });
  }, [data, branchId, stateDisplayName, branchDisplayName]);

  if (!branchId) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="rounded-2xl border border-[#EEF2F6] bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Branch not found
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Logged in branch information is missing.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="w-full">
      <InventoryItems
        data={itemRows}
        branchId={String(branchId)}
        state={stateDisplayName}
      />
    </div>
  );
}