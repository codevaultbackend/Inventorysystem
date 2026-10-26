"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  normalizeStatus,
} from "../../../utils/inventoryUtils";

const API_URL =
  "https://ims-backend-5usi.onrender.com/combine/dashboard/inventory";

type DashboardData = {
  cards?: {
    totalStockItems?: number;
    purchaseAmount?: number;
    totalStockValue?: number;
    transitItems?: number;
  };

  purchaseChart?: {
    month?: string;
    amount?: number;
  }[];

  agingChart?: {
    available?: number;
    damaged?: number;
    repairable?: number;
  };

  inventoryTable?: any[];
};

export default function InventoryBranchPage() {
  const { loading: authLoading } =
    useAuth();

  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All Categories");

  // ================================
  // FETCH DASHBOARD
  // ================================

  useEffect(() => {
    let mounted = true;

    const controller =
      new AbortController();

    const fetchDashboard =
      async () => {
        try {
          setLoading(true);

          setError("");

          const token =
            localStorage.getItem(
              "token"
            ) ||
            localStorage.getItem(
              "accessToken"
            );

          const response =
            await fetch(API_URL, {
              method: "GET",

              signal:
                controller.signal,

              headers: {
                Accept:
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },
            });

          const payload =
            await response.json();

          if (
            !response.ok ||
            !payload?.success
          ) {
            throw new Error(
              payload?.message ||
                "Failed to load dashboard"
            );
          }

          if (mounted) {
            setData(
              payload?.dashboard ||
                {}
            );
          }
        } catch (err: any) {
          if (
            err?.name !==
            "AbortError"
          ) {
            setError(
              err?.message ||
                "Something went wrong while loading dashboard"
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    if (!authLoading) {
      fetchDashboard();
    }

    return () => {
      mounted = false;

      controller.abort();
    };
  }, [authLoading]);

  // ================================
  // CARDS
  // ================================

  const cards = data?.cards || {};

  // ================================
  // CHART DATA
  // ================================

  const monthlyChart =
    useMemo(() => {
      const api =
        data?.purchaseChart || [];

      return api.map(
        (
          item,
          index
        ) => ({
          month:
            item?.month ||
            `M${index + 1}`,

          amount: toNumber(
            item?.amount
          ),
        })
      );
    }, [data]);

  const agingData =
    useMemo(() => {
      const aging =
        data?.agingChart || {};

      return [
        {
          name: "Available",

          value: toNumber(
            aging?.available
          ),
        },

        {
          name: "Damaged",

          value: toNumber(
            aging?.damaged
          ),
        },

        {
          name: "Dispatched",

          value: toNumber(
            aging?.repairable
          ),
        },
      ];
    }, [data]);

  // ================================
  // TABLE
  // ================================

  const rawTable =
    data?.inventoryTable || [];

  const categories =
    useMemo(() => {
      const list = rawTable
        .map(
          (item: any) =>
            item?.categories
        )
        .filter(Boolean);

      return [
        "All Categories",

        ...Array.from(
          new Set(list)
        ),
      ];
    }, [rawTable]);

  const tableRows =
    useMemo(() => {
      return rawTable
        .filter((item: any) => {
          const query = search
            .toLowerCase()
            .trim();

          const itemDescription =
            (
              item?.description ||
              item?.itemName ||
              ""
            ).toLowerCase();

          const categoryName =
            (
              item?.categories ||
              ""
            ).toLowerCase();

          const subCategoryName =
            (
              item?.subCategory ||
              ""
            ).toLowerCase();

          const matchSearch =
            itemDescription.includes(
              query
            ) ||
            categoryName.includes(
              query
            ) ||
            subCategoryName.includes(
              query
            );

          const matchCategory =
            category ===
              "All Categories" ||
            categoryName ===
              category.toLowerCase();

          return (
            matchSearch &&
            matchCategory
          );
        })

        .map((item: any) => ({
          stockId:
            item?.stockId,

          itemDescription:
            item?.description ||
            item?.itemName ||
            "-",

          category:
            item?.categories ||
            "-",

          subCategory:
            item?.subCategory ||
            "-",

          currentStock:
            toNumber(
              item?.currentStock ||
                0
            ),

          status:
            normalizeStatus(
              item?.status
            ),

          rawItem: item,
        }));
    }, [
      rawTable,
      search,
      category,
    ]);

  // ================================
  // LOADING
  // ================================

  if (
    loading ||
    authLoading
  ) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <div className="space-y-4 sm:space-y-5">
          {/* CARDS */}
          <div
            className="
              grid
              grid-cols-2
              gap-4
              max-[768px]:grid-cols-2
              xl:grid-cols-4
            "
          >
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-[148px]
                  animate-pulse
                  rounded-[22px]
                  bg-white
                "
              />
            ))}
          </div>

          {/* CHARTS */}
          <div
            className="
              grid
              grid-cols-1
              gap-5
              xl:grid-cols-[2fr_1fr]
            "
          >
            <div
              className="
                h-[340px]
                animate-pulse
                rounded-[22px]
                bg-white
              "
            />

            <div
              className="
                h-[340px]
                animate-pulse
                rounded-[22px]
                bg-white
              "
            />
          </div>

          {/* TABLE */}
          <div
            className="
              h-[420px]
              animate-pulse
              rounded-[22px]
              bg-white
            "
          />
        </div>
      </div>
    );
  }

  // ================================
  // ERROR
  // ================================

  if (error) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#F6F8FB]
          px-4
        "
      >
        <div
          className="
            max-w-[420px]
            rounded-[20px]
            border
            border-red-200
            bg-white
            p-6
            text-center
            shadow-sm
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-[56px]
              w-[56px]
              items-center
              justify-center
              rounded-full
              bg-red-50
            "
          >
            <span className="text-[24px]">
              ⚠️
            </span>
          </div>

          <h2
            className="
              text-[18px]
              font-semibold
              text-[#111827]
            "
          >
            Failed to load dashboard
          </h2>

          <p
            className="
              mt-2
              text-[14px]
              leading-[22px]
              text-[#667085]
            "
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ================================
  // UI
  // ================================

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="space-y-4 sm:space-y-5">
        {/* METRIC CARDS */}
        <div
          className="
            grid
            grid-cols-2
            gap-4
            max-[768px]:grid-cols-2
            lg:grid-cols-4
            xl:grid-cols-4
          "
        >
          <MetricCard
            label="Total Stock Items"
            value={formatNumber(
              toNumber(
                cards?.totalStockItems
              )
            )}
            positive={true}
            icon={
              <Box
                size={22}
                className="text-[#3B82F6]"
              />
            }
          />

          <MetricCard
            label="Purchase Amount"
            value={formatMoney(
              toNumber(
                cards?.purchaseAmount
              )
            )}
            positive={true}
            icon={
              <CircleDollarSign
                size={22}
                className="text-[#9333EA]"
              />
            }
          />

          <MetricCard
            label="Total Stock Value"
            value={formatMoney(
              toNumber(
                cards?.totalStockValue
              )
            )}
            positive={true}
            icon={
              <CircleDollarSign
                size={22}
                className="text-[#9333EA]"
              />
            }
          />

          <MetricCard
            label="Transit Items"
            value={formatNumber(
              toNumber(
                cards?.transitItems
              )
            )}
            positive={true}
            icon={
              <Truck
                size={22}
                className="text-[#7C3AED]"
              />
            }
          />
        </div>

        {/* CHARTS */}
        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-[2fr_1fr]
            xl:grid-cols-[2fr_1fr]
          "
        >
          {/* PURCHASE CHART */}
          <div className="min-w-0">
            <PurchaseChart
              data={monthlyChart}
            />
          </div>

          {/* AGING CHART */}
          <div className="min-w-0">
            <AgingChart
              data={agingData}
            />
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