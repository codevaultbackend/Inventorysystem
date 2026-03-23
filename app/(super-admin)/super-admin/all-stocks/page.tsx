"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import BranchOverviewPage from "../Branches/Component/BranchOverviewPage";
import { SalesTrendLine } from "../Branches/Component/SalesTrendLine";
import { StockTrendBar } from "../Branches/Component/StockTrendBar";
import AgingAnylysis from "../Branches/[state]/[branchId]/[itemId]/component/AgingAnylysis";
import { combineApi, toNumber } from "../../../lib/combineDashboardApi";

type StockItem = {
  id?: string | number;
  itemId?: string | number;
  item?: string;
  name?: string;
  sku?: string;
  category?: string;
  quantity?: number | string;
  current_stock?: number | string;
  value?: number | string;
  stock_out?: number | string;
  status?: string;
  age?: number | string;
  agingDays?: number | string;
  createdAt?: string;
};

export default function ItemAnalyzePage() {
  const params = useParams();
  const stateName = decodeURIComponent((params?.state as string) || "");
  const branchId = decodeURIComponent((params?.branchId as string) || "");
  const itemId = decodeURIComponent((params?.itemId as string) || "");

  const [active, setActive] = useState("Weekly");
  const [itemData, setItemData] = useState<any>(null);
  const [branchData, setBranchData] = useState<any>(null);
  const [allStocks, setAllStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [error, setError] = useState("");

  const dragRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setIsDragging(true);
    dragState.current = {
      startX: e.pageX - dragRef.current.offsetLeft,
      scrollLeft: dragRef.current.scrollLeft,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragRef.current) return;
    e.preventDefault();
    const x = e.pageX - dragRef.current.offsetLeft;
    const walk = x - dragState.current.startX;
    dragRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const fetchItemAndBranch = async () => {
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

    if (branchId && itemId) fetchItemAndBranch();
  }, [branchId, itemId]);

  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        setStocksLoading(true);

        // Most likely branch-wise stocks endpoint.
        // If your actual backend endpoint is different,
        // replace only this URL.
        const stocksRes = await combineApi.get(
          `/combine/dashboard/branch-stocks/${encodeURIComponent(branchId)}`
        );

        const raw =
          stocksRes?.data?.data ||
          stocksRes?.data?.stocks ||
          stocksRes?.data?.items ||
          stocksRes?.data ||
          [];

        setAllStocks(Array.isArray(raw) ? raw : []);
      } catch (err: any) {
        console.error("Failed to load all stocks:", err);

        // fallback: try to read stocks from already fetched branch response shape
        const fallbackStocks =
          branchData?.stocks ||
          branchData?.items ||
          branchData?.inventory ||
          branchData?.data ||
          [];

        setAllStocks(Array.isArray(fallbackStocks) ? fallbackStocks : []);
      } finally {
        setStocksLoading(false);
      }
    };

    if (branchId) fetchAllStocks();
  }, [branchId, branchData]);

  const statsData = useMemo(() => {
    return {
      totalStock: toNumber(itemData?.current_stock ?? itemData?.quantity),
      totalStockValue: toNumber(itemData?.value),
      totalSales: toNumber(itemData?.stock_out),
      agingItems: allStocks.length,
    };
  }, [itemData, allStocks]);

  const stockStatusData = useMemo(() => {
    const good = allStocks.filter(
      (row) => String(row?.status || "").toUpperCase() === "GOOD"
    ).length;

    const damaged = allStocks.filter(
      (row) => String(row?.status || "").toUpperCase() === "DAMAGED"
    ).length;

    const repairable = allStocks.filter(
      (row) => String(row?.status || "").toUpperCase() === "REPAIRABLE"
    ).length;

    return {
      good,
      damaged,
      repairable,
    };
  }, [allStocks]);

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

  const agingAnalysisData = useMemo(() => {
    return allStocks.map((row, index) => ({
      id: row.id ?? row.itemId ?? index + 1,
      item: row.item || row.name || `Item ${index + 1}`,
      sku: row.sku || "-",
      category: row.category || "-",
      quantity: toNumber(row.current_stock ?? row.quantity),
      value: toNumber(row.value),
      status: row.status || "GOOD",
      agingDays: toNumber(row.agingDays ?? row.age),
      createdAt: row.createdAt || "-",
    }));
  }, [allStocks]);

  if (loading) {
    return <div className="p-4 sm:p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 sm:p-6">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-4 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-[22px] font-semibold text-[#111827] sm:text-[26px]">
              {itemData?.item || itemData?.name || itemId}
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Branch: {branchData?.branch?.name || branchId}
              {stateName ? ` • State: ${stateName}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Daily", "Weekly", "Monthly"].map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active === item
                    ? "bg-blue-600 text-white"
                    : "border border-[#E5E7EB] bg-white text-gray-600 hover:bg-[#F9FAFB]"
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

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-[16px]">
          <SalesTrendLine data={salesTrendData} />
          <StockTrendBar data={stockTrendData} />
        </div>

        <div className="mt-4">
          <BranchOverviewPage
            stats={statsData}
            stockStatus={stockStatusData}
            branchSummary={branchSummary}
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-[18px] border border-[#E8EDF3] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-[#EEF2F6] px-4 py-4 sm:px-5">
            <h2 className="text-[16px] font-semibold text-[#111827] sm:text-[18px]">
              All Stocks in This Branch
            </h2>
            <p className="mt-1 text-[12px] text-[#6B7280] sm:text-[13px]">
              View complete stock list for this branch. Drag left/right on smaller devices to see hidden columns.
            </p>
          </div>

          <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[12px] text-[#94A3B8] sm:text-[13px]">
                {stocksLoading ? "Loading stocks..." : `${agingAnalysisData.length} stocks found`}
              </p>
              <p className="hidden text-[12px] text-[#94A3B8] sm:block">
                Drag horizontally to view all data
              </p>
            </div>

            <div
              ref={dragRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              className={`overflow-x-auto rounded-xl ${
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              }`}
            >
              <div className="min-w-[980px]">
                <AgingAnylysis data={agingAnalysisData} />
              </div>
            </div>

            <p className="mt-3 text-[12px] text-[#94A3B8] sm:hidden">
              Swipe or drag left/right to view more stock data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}