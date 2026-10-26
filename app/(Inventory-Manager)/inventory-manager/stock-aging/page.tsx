"use client";

import axios from "axios";

import {
  AlertTriangle,
  Boxes,
  Package,
  Clock3,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StockCount from "../../Components/StockCounts";

import AgingDistributionChart from "./component/AgingDistributionChart";
import AgingCategoryBarChart from "./component/AgingCategoryBarChart";
import AgingInventoryTable from "./component/AgingInventoryTable";

type DashboardData = {
  cards: {
    totalItems: number;
    freshStocks: number;
    critical: number;
    averageAging: number;
  };

  agingDistribution: Record<
    string,
    number
  >;

  agingByCategory: {
    category: string;
    average: number;
    good: number;
    repairable: number;
    damaged: number;
  }[];

  table: {
    purchaseOrderNo: string;
    itemName: string;
    categories: string;
    branch: string;
    quantity: number;
    value: number;
    status: string;
  }[];
};

/**
 * EXACT FIGMA COLORS
 * + softer premium palette
 */
const PIE_COLORS = [
  "#FF7A45",
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#A855F7",
  "#14B8A6",
];

export default function StockAgingPage() {
  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /**
   * FETCH
   */
  useEffect(() => {
    const controller =
      new AbortController();

    async function fetchDashboard() {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "Authentication token missing"
          );
        }

        const response =
          await axios.get(
            "https://ims-backend-5usi.onrender.com/combine/dashboard/aging",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },

              signal:
                controller.signal,

              timeout: 15000,
            }
          );

        if (
          response.data?.success
        ) {
          setDashboardData(
            response.data
              .dashboard
          );
        }

      } catch (err: any) {

        if (
          err?.name !==
          "CanceledError"
        ) {
          setError(
            err?.message ||
            "Failed to load dashboard"
          );
        }

      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();

    return () =>
      controller.abort();

  }, []);

  /**
   * SAFE DEFAULTS
   */
  const stats =
    dashboardData?.cards || {
      totalItems: 0,
      freshStocks: 0,
      critical: 0,
      averageAging: 0,
    };

  /**
   * PIE DATA
   */
  const agingPieData =
    useMemo(() => {

      return Object.entries(
        dashboardData
          ?.agingDistribution || {}
      )
        .filter(
          ([, value]) =>
            Number(value) > 0
        )
        .map(
          (
            [key, value],
            index
          ) => ({
            name: key,

            value:
              Number(value),

            color:
              PIE_COLORS[
              index %
              PIE_COLORS.length
              ],
          })
        );

    }, [
      dashboardData?.agingDistribution,
    ]);

  /**
   * BAR DATA
   */
  const categoryBarData =
    useMemo(() => {

      return (
        dashboardData
          ?.agingByCategory || []
      ).map((item) => ({
        name:
          item.category?.trim() ||
          "Unknown",

        blue: Number(
          item.average || 0
        ),

        green: Number(
          item.good || 0
        ),

        yellow: Number(
          item.repairable || 0
        ),

        red: Number(
          item.damaged || 0
        ),
      }));

    }, [
      dashboardData?.agingByCategory,
    ]);

  /**
   * TABLE DATA
   */
  const tableData =
    useMemo(() => {

      return (
        dashboardData?.table || []
      ).map((item) => ({
        po:
          item.purchaseOrderNo ||
          "N/A",

        item:
          item.itemName || "-",

        category:
          item.categories ||
          "Uncategorized",

        branch:
          item.branch || "N/A",

        qty:
          Number(
            item.quantity
          ) || 0,

        value: `₹${Number(
          item.value || 0
        ).toLocaleString(
          "en-IN"
        )}`,

        status:
          item.status
            ?.toLowerCase()
            ?.trim() ===
            "fresh"
            ? "Good"
            : item.status ||
            "Unknown",
      }));

    }, [
      dashboardData?.table,
    ]);

  /**
   * LOADING STATE
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB]  xl:px-0">
        <div className="mx-auto max-w-[1600px]">
          <div className="space-y-6">

            {/* HEADER */}
            <div>
              <div className="h-[38px] w-[280px] animate-pulse rounded-[10px] bg-white" />

              <div className="mt-3 h-[16px] w-[420px] animate-pulse rounded-[10px] bg-white" />
            </div>

            {/* CARDS */}
            <div
              className="
    grid
    grid-cols-1
    gap-5

    md:grid-cols-2
    xl:grid-cols-4
  "
            >
              <StockCount
                title="Total Items"
                value={stats.totalItems}
                icon={Package}
              />

              <StockCount
                title="Fresh Stocks"
                value={stats.freshStocks}
                icon={Boxes}
              />

              <StockCount
                title="Critical"
                value={stats.critical}
                icon={AlertTriangle}
              />

              <StockCount
                title="Average Aging"
                value={stats.averageAging}
                icon={Clock3}
              />
            </div>


            {/* CHARTS */}
            <div
              className="
                grid
                grid-cols-1
                gap-6

                2xl:grid-cols-2
              "
            >
              <div className="h-[365px] animate-pulse rounded-[28px] bg-white" />

              <div className="h-[365px] animate-pulse rounded-[28px] bg-white" />
            </div>

            {/* TABLE */}
            <div className="h-[420px] animate-pulse rounded-[28px] bg-white" />

          </div>
        </div>
      </div>
    );
  }

  /**
   * ERROR STATE
   */
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] px-4 sm:px-6 xl:px-0">
        <div className="mx-auto max-w-[1600px]">
          <div
            className="
              flex
              min-h-[420px]
              flex-col
              items-center
              justify-center

              rounded-[28px]
              border
              border-[#EAECF0]

              bg-white
            "
          >
            <div
              className="
                flex
                h-[64px]
                w-[64px]
                items-center
                justify-center

                rounded-full
                bg-[#FEF3F2]
              "
            >
              <AlertTriangle
                className="text-[#F04438]"
                size={30}
              />
            </div>

            <h3
              className="
                mt-5
                text-[18px]
                font-[700]
                text-[#101828]
              "
            >
              Failed to load dashboard
            </h3>

            <p
              className="
                mt-2
                text-[14px]
                text-[#98A2B3]
              "
            >
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * PAGE
   */
  return (
    <div
      className="
        min-h-screen
        bg-[#F5F7FB]
        xl:px-0
      "
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="space-y-4">

          {/* HEADER */}
          <div>
            <h1
              className="
                text-[24px]
                font-[500]
                leading-[40px]
                tracking-[-0.35px]

                text-[#101828]

                max-[768px]:text-[28px]
                max-[]768px:leading-[26px]
              "
            >
              Stock Aging Analysis
            </h1>

            <p
              className="
                text-[12px]
                font-[400]
                leading-[22px]
                tracking-[-0.15px]

                text-[#99A1AF]
              "
            >
              Detailed breakdown of
              inventory lifespan and
              turnover rates.
            </p>
          </div>

          {/* CARDS */}
          <div
            className="
              grid
              grid-cols-2
              gap-5

              md:grid-cols-2
              lg:grid-cols-4
              xl:grid-cols-4
            "
          >
            <StockCount
              title="Total Items"
              value={
                stats.totalItems
              }
              icon={Package}
            />

            <StockCount
              title="Fresh Stocks"
              value={
                stats.freshStocks
              }
              icon={Boxes}
            />

            <StockCount
              title="Critical"
              value={
                stats.critical
              }
              icon={
                AlertTriangle
              }
            />

            <StockCount
              title="Average Aging"
              value={
                stats.averageAging
              }
              icon={Clock3}
            />
          </div>

          {/* CHARTS */}
          <div
            className="
              grid
              grid-cols-2
              gap-6
              max-[768px]:grid-cols-1

              2xl:grid-cols-2
            "
          >
            <AgingDistributionChart
              data={agingPieData}
            />

            <AgingCategoryBarChart
              data={
                categoryBarData
              }
            />
          </div>

          {/* TABLE */}
          <AgingInventoryTable
            data={tableData}
          />
        </div>
      </div>
    </div>
  );
}