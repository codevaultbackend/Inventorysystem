"use client";

import { useEffect, useMemo, useState } from "react";
import InventoryItems, {
  InventoryItemRow,
} from "../Branches/Component/InventoryItems";
import { useAuth } from "@/app/context/AuthContext";
import { combineApi, toNumber } from "@/app/lib/combineDashboardApi";

type BranchApiResponse = {
  branchInfo?: {
    id?: number | string;
    name?: string;
    state?: string;
  };
  stocks?: Array<{
    id?: number | string;
    item?: string;
    itemName?: string;
    category?: string;
    quantity?: number | string;
    current_stock?: number | string;
    hsn?: string;
    grn?: string;
    batchNo?: string;
    batch_no?: string;
    aging?: number | string;
    status?: string;
    stock_in?: number | string;
    stock_out?: number | string;
    branch_id?: number | string;
  }>;
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
  const { user, branchName: authBranchName, stateName: authStateName } = useAuth();

  const role = String(user?.role || "");
  const authBranchId = getUserBranchId(user);

  const [data, setData] = useState<BranchApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError("");

        // admin: always own branch
        // super_admin all-stocks page can also work with own/current branch if needed
        const resolvedBranchId = authBranchId;

        if (!resolvedBranchId) {
          setError("Branch ID not found");
          setLoading(false);
          return;
        }

        const res = await combineApi.get(
          `/sqlbranch/branch/${encodeURIComponent(resolvedBranchId)}`
        );

        setData(res?.data || null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load inventory items"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [authBranchId, role]);

  const itemRows: InventoryItemRow[] = useMemo(() => {
    const stocks = Array.isArray(data?.stocks) ? data?.stocks : [];

    return stocks.map((item) => ({
      id: String(item?.id ?? ""),
      itemName: String(item?.itemName ?? item?.item ?? "-"),
      category: String(item?.category ?? "General"),
      quantity: toNumber(item?.quantity ?? item?.current_stock),
      hsn: String(item?.hsn ?? "-"),
      grn: String(item?.grn ?? "-"),
      batchNo: String(item?.batchNo ?? item?.batch_no ?? "-"),
      aging: item?.aging ?? "-",
      status: String(item?.status ?? "-"),
      stockIn: toNumber(item?.stock_in),
      stockOut: toNumber(item?.stock_out),
      branchId: String(item?.branch_id ?? authBranchId ?? ""),
    }));
  }, [data, authBranchId]);

  const branchDisplayName =
    data?.branchInfo?.name || authBranchName || "My Branch";
  const stateDisplayName =
    data?.branchInfo?.state || authStateName || "";

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl border border-[#EEF2F6] bg-white p-5 shadow-sm">
        <h1 className="text-[22px] font-semibold text-[#0F172A]">
          All Stocks
        </h1>
        <p className="mt-1 text-[13px] text-[#64748B]">
          {branchDisplayName}
          {stateDisplayName ? ` • ${stateDisplayName}` : ""}
        </p>
      </div>

      <InventoryItems
        data={itemRows}
        branchId={authBranchId}
        state={stateDisplayName}
        branchName={branchDisplayName}
      />
    </div>
  );
}