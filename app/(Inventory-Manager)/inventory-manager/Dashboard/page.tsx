"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Box,
  CircleDollarSign,
  Truck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ApiItem = {
  itemName: string;
  categories: string;
  hsnCode: string;
  grnNo: string | null;
  poNumber: string;
  currentStock: number;
  stockIn: number;
  stockOut: number;
  scrap: number;
  dispatchDate: string;
  deliveryDate: string;
  status: string;
};

type DashboardApi = {
  success: boolean;
  role: string;
  dashboard: {
    cards: {
      totalStockItems: number;
      totalStockValue: number;
      purchaseAmount: number;
      transitItems: number;
    };
    purchaseChart: any[];
    agingChart: {
      available: number;
      damaged: number;
      repairable: number;
    };
    inventoryTable: ApiItem[];
  };
};

const API_URL =
  "https://ims-backend-nm9g.onrender.com/combine/dashboard/inventory";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

function formatCurrency(value: number) {
  return `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toISOString().split("T")[0];
}

function statusClass(status: string) {
  const s = String(status || "").toLowerCase();

  if (s.includes("good")) return "bg-[#D9FBE8] text-[#11B85A]";
  if (s.includes("damage")) return "bg-[#FFE3E5] text-[#FF4D55]";
  if (s.includes("repair")) return "bg-[#FFF8BF] text-[#D3AA00]";

  return "bg-[#EAF1FF] text-[#2F80ED]";
}

function MetricCard({
  label,
  value,
  icon,
  showTrend = true,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  showTrend?: boolean;
}) {
  return (
    <div className="h-[154px] rounded-[20px] border border-[#E8EDF3] bg-white px-6 py-5 shadow-[0_1px_4px_rgba(16,24,40,0.08)]">
      <div className="flex h-full flex-col justify-between">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px] bg-[#F5FAFF]">
          {icon}
        </div>

        <div>
          <p className="text-[13px] font-medium text-[#9AA0AA]">{label}</p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <h3 className="text-[30px] font-medium leading-[34px] tracking-[-0.04em] text-[#030712]">
              {value}
            </h3>

           
          </div>
        </div>
      </div>
    </div>
  );
}

function DraggableScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        const el = ref.current;
        if (!el) return;

        isDown.current = true;
        startX.current = e.pageX - el.offsetLeft;
        startY.current = e.pageY - el.offsetTop;
        scrollLeft.current = el.scrollLeft;
        scrollTop.current = el.scrollTop;
      }}
      onMouseLeave={() => (isDown.current = false)}
      onMouseUp={() => (isDown.current = false)}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el || !isDown.current) return;

        e.preventDefault();

        const x = e.pageX - el.offsetLeft;
        const y = e.pageY - el.offsetTop;

        el.scrollLeft = scrollLeft.current - (x - startX.current);
        el.scrollTop = scrollTop.current - (y - startY.current);
      }}
      className="custom-scroll h-full w-full cursor-grab overflow-auto active:cursor-grabbing"
    >
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardApi["dashboard"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInventoryDashboard() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");

        const res = await fetch(API_URL, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data: DashboardApi = await res.json();

        if (!res.ok || !data.success) {
          throw new Error("Failed to fetch inventory dashboard");
        }

        setDashboard(data.dashboard);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInventoryDashboard();
  }, []);

  const cards = dashboard?.cards;

  const tableRows = useMemo(() => {
    return dashboard?.inventoryTable || [];
  }, [dashboard]);

  const purchaseChart = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

    if (dashboard?.purchaseChart?.length) {
      return dashboard.purchaseChart.map((item: any) => ({
        month: item.month || item.name || "-",
        amount: Number(item.amount || item.value || 0),
      }));
    }

    return months.map((month) => ({
      month,
      amount: Number(cards?.purchaseAmount || 0),
    }));
  }, [dashboard, cards]);

  const agingChart = useMemo(() => {
    const aging = dashboard?.agingChart;

    return [
      { name: "Available", value: Number(aging?.available || 0) },
      { name: "Damaged", value: Number(aging?.damaged || 0) },
      { name: "Repairable", value: Number(aging?.repairable || 0) },
    ];
  }, [dashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] p-4">
        <div className="h-[700px] animate-pulse rounded-[24px] bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.03em] text-[#111827]">
            Inventory Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-[#9AA0AA]">
            Detailed inventory analytics and stock overview
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Stock Items"
            value={formatNumber(cards?.totalStockItems || 0)}
            icon={<Box size={24} className="text-[#2F80ED]" />}
          />

          <MetricCard
            label="Purchase Amount"
            value={formatCurrency(cards?.purchaseAmount || 0)}
            icon={<CircleDollarSign size={24} className="text-[#8B5CF6]" />}
            showTrend={false}
          />

          <MetricCard
            label="Total Stock Value"
            value={formatCurrency(cards?.totalStockValue || 0)}
            icon={<CircleDollarSign size={24} className="text-[#8B5CF6]" />}
            showTrend={false}
          />

          <MetricCard
            label="Transit Items"
            value={formatNumber(cards?.transitItems || 0)}
            icon={<Truck size={24} className="text-[#6D5DFB]" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <div className="h-[405px] rounded-[22px] border border-[#E8EDF3] bg-white px-6 py-6 shadow-[0_1px_4px_rgba(16,24,40,0.08)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-semibold text-[#111827]">
                Purchase Amount Over Time
              </h2>

              
            </div>

            <div className="h-[315px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={purchaseChart}>
                  <defs>
                    <linearGradient
                      id="purchaseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2F80ED" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#2F80ED" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#EAF0F7"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9BAAC0", fontSize: 13 }}
                    dy={12}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9BAAC0", fontSize: 13 }}
                    width={55}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#2F80ED"
                    strokeWidth={3}
                    fill="url(#purchaseGradient)"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="h-[405px] rounded-[22px] border border-[#E8EDF3] bg-white px-6 py-6 shadow-[0_1px_4px_rgba(16,24,40,0.08)]">
            <h2 className="text-[18px] font-semibold text-[#111827]">
              Aging Distribution
            </h2>

            <p className="mt-2 text-[14px] font-medium text-[#111827]">
              Stock breakdown by age groups
            </p>

            <div className="mt-5 h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agingChart}
                    dataKey="value"
                    innerRadius={68}
                    outerRadius={105}
                    paddingAngle={7}
                    stroke="#fff"
                    strokeWidth={8}
                  >
                    {agingChart.map((_, index) => (
                      <Cell
                        key={index}
                        fill={["#2F80ED", "#FF4D55", "#8B5CF6"][index]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[14px] text-[#374151]">
              {["Available", "Damaged", "Repairable"].map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <span
                    className="h-[12px] w-[12px]"
                    style={{
                      backgroundColor: ["#2F80ED", "#FF4D55", "#8B5CF6"][index],
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[22px] border border-[#E8EDF3] bg-white shadow-[0_1px_4px_rgba(16,24,40,0.08)]">
          <div className="flex min-h-[76px] flex-col gap-2 px-5 py-5 sm:px-6">
            <h2 className="text-[18px] font-semibold leading-[24px] text-[#111827]">
              State Overview
            </h2>
            <p className="text-[13px] leading-[18px] text-[#9AA0AA]">
              Inventory summary by state
            </p>
          </div>

          <div className="h-[370px] border-t border-[#E8EDF3]">
            <DraggableScroll>
              <table className="w-full min-w-[980px] border-separate border-spacing-0">
                <thead className="sticky top-0 z-20">
                  <tr>
                    {[
                      "Item Name",
                      "Category",
                      "Current Stock",
                      "Stock In",
                      "Stock Out",
                      "Total Value",
                      "Action",
                    ].map((head, index) => (
                      <th
                        key={head}
                        className={`h-[48px] border-b border-[#E5E7EB] bg-[#F6FAFD] px-6 text-left text-[14px] font-semibold text-[#111827] ${
                          index === 0 ? "sticky left-0 z-30" : ""
                        }`}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableRows.length > 0 ? (
                    tableRows.map((row, index) => (
                      <tr
                        key={`${row.itemName}-${index}`}
                        className="group bg-white transition hover:bg-[#FBFDFF]"
                      >
                        <td className="sticky left-0 z-10 h-[52px] border-b border-[#E5E7EB] bg-white px-6 text-[14px] font-semibold text-[#111827] group-hover:bg-[#FBFDFF]">
                          {row.itemName}
                        </td>

                        <td className="h-[52px] border-b border-[#E5E7EB] px-6 text-[14px] text-[#111827]">
                          {row.categories}
                        </td>

                        <td className="h-[52px] border-b border-[#E5E7EB] px-6 text-[14px] text-[#111827]">
                          {formatNumber(row.currentStock)}
                        </td>

                        <td className="h-[52px] border-b border-[#E5E7EB] px-6 text-[14px] text-[#111827]">
                          {formatNumber(row.stockIn)}
                        </td>

                        <td className="h-[52px] border-b border-[#E5E7EB] px-6 text-[14px] text-[#111827]">
                          {formatNumber(row.stockOut)}
                        </td>

                        <td className="h-[52px] border-b border-[#E5E7EB] px-6 text-[14px] font-medium text-[#111827]">
                          {formatCurrency(row.currentStock)}
                        </td>

                        <td className="h-[52px] border-b border-[#E5E7EB] px-6 text-[14px]">
                          <Link
                            href={`/inventory-manager/Branches/${encodeURIComponent(
                              row.itemName
                            )}`}
                            className="font-medium text-[#0B66D8] underline underline-offset-2 transition hover:text-[#084F93]"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="h-[180px] text-center text-sm font-medium text-[#64748B]"
                      >
                        No inventory data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DraggableScroll>
          </div>
        </section>
      </div>

      <style jsx>{`
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .custom-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}