// ================================
// InventoryBranchPage.tsx
// ================================

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Truck,
  CircleDollarSign,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";

import MetricCard from "./components/MetricCard";
import InventoryTable from "./components/InventoryTable";
import {
  PurchaseChart,
  AgingChart,
} from "./components/InventoryCharts";

import {
  toNumber,
  formatNumber,
  formatMoney,
  formatDate,
  normalizeStatus,
} from "../../../utils/inventoryUtils";

const API_URL =
  "https://ims-backend-nm9g.onrender.com/combine/dashboard/inventory";

export default function InventoryBranchPage() {
  const { loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("All Categories");

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        const res = await fetch(API_URL, {
          headers: {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        });

        const payload = await res.json();

        if (!res.ok || !payload?.success) {
          throw new Error(
            payload?.message || "API Error"
          );
        }

        if (mounted) {
          setData(payload.dashboard || {});
        }
      } catch (err: any) {
        setError(
          err?.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboard();
    }

    return () => {
      mounted = false;
    };
  }, [authLoading]);

  const cards = data?.cards || {};
  const rawTable = data?.inventoryTable || [];

  const monthlyChart = useMemo(() => {
    const api = data?.purchaseChart || [];

    return api.map((item: any, index: number) => ({
      month: item.month || `M${index + 1}`,
      amount: toNumber(item.amount),
    }));
  }, [data]);

  const agingData = useMemo(() => {
    const a = data?.agingChart || {};

    return [
      {
        name: "Available",
        value: toNumber(a.available),
      },
      {
        name: "Damaged",
        value: toNumber(a.damaged),
      },
      {
        name: "Dispatched",
        value: toNumber(a.repairable),
      },
    ];
  }, [data]);

  const categories = useMemo(() => {
    const list = rawTable
      .map((item: any) => item.categories)
      .filter(Boolean);

    return [
      "All Categories",
      ...Array.from(new Set(list)),
    ];
  }, [rawTable]);

  const tableRows = useMemo(() => {
    return rawTable
      .filter((item: any) => {
        const q = search.toLowerCase();

        const matchSearch =
          String(item.itemName || "")
            .toLowerCase()
            .includes(q) ||
          String(item.categories || "")
            .toLowerCase()
            .includes(q);

        const matchCategory =
          category === "All Categories" ||
          item.categories === category;

        return matchSearch && matchCategory;
      })
      .map((item: any) => ({
        itemName: item.itemName || "-",
        categories: item.categories || "-",
        currentStock: toNumber(item.currentStock),
        status: normalizeStatus(item.status),
      }));
  }, [rawTable, search, category]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FB]">
        <div className="text-[15px] font-medium text-[#667085]">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-4">
        <div className="rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="space-y-5 md:space-y-6">

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
          
          <MetricCard
            label="Total Stock Items"
            value={formatNumber(
              toNumber(cards.totalStockItems)
            )}
            icon={
              <Box
                size={24}
                className="text-[#3B82F6]"
              />
            }
          />

          <MetricCard
            label="Purchase Amount"
            value={formatMoney(
              toNumber(cards.purchaseAmount)
            )}
            icon={
              <CircleDollarSign
                size={24}
                className="text-[#9333EA]"
              />
            }
          />

          <MetricCard
            label="Total Stock Value"
            value={formatMoney(
              toNumber(cards.totalStockValue)
            )}
            icon={
              <CircleDollarSign
                size={24}
                className="text-[#9333EA]"
              />
            }
          />

          <MetricCard
            label="Transit Items"
            value={formatNumber(
              toNumber(cards.transitItems)
            )}
            icon={
              <Truck
                size={24}
                className="text-[#7C3AED]"
              />
            }
          />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.9fr_0.85fr]">
          
          <div className="h-[380px] sm:h-[420px] xl:h-[430px]">
            <PurchaseChart data={monthlyChart} />
          </div>

          <div className="h-[380px] sm:h-[420px] xl:h-[430px]">
            <AgingChart data={agingData} />
          </div>
        </div>

        {/* TABLE */}
        <InventoryTable
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
          rows={tableRows}
        />
      </div>
    </div>
  );
}