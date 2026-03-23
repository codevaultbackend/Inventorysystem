"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BranchOverviewPage from "../../../Component/BranchOverviewPage";
import { SalesTrendLine } from "../../../Component/SalesTrendLine";
import { StockTrendBar } from "../../../Component/StockTrendBar";
import AgingAnylysis from "./component/AgingAnylysis";
import { combineApi, toNumber } from "../../../../../../lib/combineDashboardApi";

export default function ItemAnalyzePage() {
  const params = useParams();
  const stateName = decodeURIComponent((params?.state as string) || "");
  const branchId = decodeURIComponent((params?.branchId as string) || "");
  const itemId = decodeURIComponent((params?.itemId as string) || "");

  const [active, setActive] = useState("Weekly");
  const [itemData, setItemData] = useState<any>(null);
  const [branchData, setBranchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const [itemRes, branchRes] = await Promise.all([
          combineApi.get(
            `/combine/dashboard/item/${encodeURIComponent(branchId)}/${encodeURIComponent(
              itemId
            )}`
          ),
          combineApi.get(
            `/combine/dashboard/branch-id/${encodeURIComponent(branchId)}`
          ),
        ]);

        setItemData(itemRes?.data?.data || itemRes?.data || null);
        setBranchData(branchRes?.data?.data || branchRes?.data || null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || "Failed to load item"
        );
      } finally {
        setLoading(false);
      }
    };

    if (branchId && itemId) fetchItem();
  }, [branchId, itemId]);

  const statsData = useMemo(() => {
    return {
      totalStock: toNumber(itemData?.current_stock ?? itemData?.quantity),
      totalStockValue: toNumber(itemData?.value),
      totalSales: toNumber(itemData?.stock_out),
      agingItems: 0,
    };
  }, [itemData]);

  const stockStatusData = useMemo(() => {
    const status = String(itemData?.status || "").toUpperCase();
    return {
      good: status === "GOOD" ? 1 : 0,
      damaged: status === "DAMAGED" ? 1 : 0,
      repairable: status === "REPAIRABLE" ? 1 : 0,
    };
  }, [itemData]);

  const branchSummary = useMemo(() => {
    return {
      totalBranches: 1,
      activeBranches: 1,
      inactiveBranches: 0,
    };
  }, []);

  const stockTrendData = useMemo(() => {
    const monthly = branchData?.charts?.monthlyTrend || [];
    return monthly.map((row: any) => ({
      week: row.month,
      in: toNumber(row.amount),
      out: 0,
    }));
  }, [branchData]);

  const salesTrendData = useMemo(() => {
    const monthly = branchData?.charts?.monthlyTrend || [];
    return monthly.map((row: any) => ({
      week: row.month,
      purchase: toNumber(row.amount),
      sales: 0,
    }));
  }, [branchData]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-[768px]:bg-transparent max-[768px]:border-[0] max-[768px]:shadow-[0] max-[768px]:p-0 bg-[#F7F9FB] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {itemData?.item || itemData?.name || itemId}
          </h1>
          <p className="text-gray-500 text-sm">
            Branch: {branchData?.branch?.name || branchId}
          </p>
        </div>

        <div className="flex gap-2">
          {["Daily", "Weekly", "Monthly"].map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                active === item
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <BranchOverviewPage
        stats={statsData}
        stockStatus={stockStatusData}
        branchSummary={branchSummary}
      />

      <div className="grid lg:grid-cols-2 mt-[16px] sm:grid-cols-1 lg:gap-[16px] lg:mt-[16px]">
        <SalesTrendLine data={salesTrendData} />
        <StockTrendBar data={stockTrendData} />
      </div>

      <div className="!mt-[10px]">
        <BranchOverviewPage
          stats={statsData}
          stockStatus={stockStatusData}
          branchSummary={branchSummary}
        />
      </div>

      <div className="mt-[10px]">
        <AgingAnylysis data={[]} />
      </div>
    </div>
  );
}