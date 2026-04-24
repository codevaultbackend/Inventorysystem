"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Box,
  Search,
  Truck,
  CircleDollarSign,
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
import { useAuth } from "@/app/context/AuthContext";

const API_URL =
  "https://ims-backend-nm9g.onrender.com/combine/dashboard/inventory";

type ApiInventoryItem = {
  itemName?: string;
  categories?: string;
  hsnCode?: string | null;
  grnNo?: string | null;
  poNumber?: string | null;
  currentStock?: number | string;
  stockIn?: number | string;
  stockOut?: number | string;
  scrap?: number | string;
  dispatchDate?: string | null;
  deliveryDate?: string | null;
  status?: string;
};

type ApiDashboard = {
  cards?: {
    totalStockItems?: number | string;
    totalStockValue?: number | string;
    purchaseAmount?: number | string;
    transitItems?: number | string;
  };
  purchaseChart?: any[];
  agingChart?: {
    available?: number | string;
    damaged?: number | string;
    repairable?: number | string;
  };
  inventoryTable?: ApiInventoryItem[];
};

const toNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

const formatMoney = (value: number) =>
  `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`;

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeStatus = (status?: string) => {
  if (status === "GOOD") return "Good";
  if (status === "DAMAGED") return "Damaged";
  if (status === "REPAIRABLE") return "Repairable";
  return status || "-";
};

const statusClass = (status: string) => {
  const s = String(status || "").toLowerCase();

  if (s.includes("fresh") || s.includes("good")) {
    return "bg-[#D9FBE8] text-[#11B85A]";
  }

  if (s.includes("damage")) {
    return "bg-[#FFE3E5] text-[#FF4D55]";
  }

  if (s.includes("repair")) {
    return "bg-[#FFF8BF] text-[#D3AA00]";
  }

  return "bg-[#EAF1FF] text-[#2F80ED]";
};

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

function MetricCard({
  label,
  value,
  icon,
  showTrend = false,
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
          <p className="text-[13px] font-medium leading-[18px] text-[#9AA0AA]">
            {label}
          </p>

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

export default function InventoryBranchPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const [data, setData] = useState<ApiDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
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
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const payload = await res.json();

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Invalid API response");
        }

        if (!mounted) return;
        setData(payload?.dashboard || {});
      } catch (err: any) {
        if (!mounted) return;

        if (err?.response?.status === 401) {
          localStorage.clear();
          router.replace("/login");
          return;
        }

        setError(err?.message || "Failed to load branch dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!authLoading) fetchDashboard();

    return () => {
      mounted = false;
    };
  }, [authLoading, router]);

  const cards = data?.cards || {};
  const rawTable = data?.inventoryTable || [];

  const monthlyChart = useMemo(() => {
    const api = Array.isArray(data?.purchaseChart) ? data.purchaseChart : [];

    return api.map((item: any, index: number) => ({
      month: item.month || item.week || item.name || `Point ${index + 1}`,
      amount: toNumber(item.amount || item.purchaseAmount || item.purchase || 0),
    }));
  }, [data]);

  const agingData = useMemo(() => {
    const aging = data?.agingChart || {};

    return [
      { name: "Available", value: toNumber(aging.available) },
      { name: "Damaged", value: toNumber(aging.damaged) },
      { name: "Repairable", value: toNumber(aging.repairable) },
    ];
  }, [data]);

  const categories = useMemo(() => {
    const list = rawTable.map((item) => item.categories).filter(Boolean);
    return ["All Categories", ...Array.from(new Set(list))];
  }, [rawTable]);

  const tableRows = useMemo(() => {
    return rawTable
      .filter((item) => {
        const q = search.toLowerCase();

        const matchSearch =
          String(item.itemName || "").toLowerCase().includes(q) ||
          String(item.categories || "").toLowerCase().includes(q) ||
          String(item.poNumber || "").toLowerCase().includes(q) ||
          String(item.hsnCode || "").toLowerCase().includes(q) ||
          String(item.grnNo || "").toLowerCase().includes(q);

        const matchCategory =
          category === "All Categories" || item.categories === category;

        return matchSearch && matchCategory;
      })
      .map((item) => ({
        itemName: item.itemName || "-",
        categories: item.categories || "-",
        hsnCode: item.hsnCode || "-",
        grnNo: item.grnNo || "-",
        purchaseOrderNo: item.poNumber || "N/A",
        currentStock: toNumber(item.currentStock),
        stockIn: toNumber(item.stockIn),
        stockOut: toNumber(item.stockOut),
        scrap: toNumber(item.scrap),
        dispatchDate: formatDate(item.dispatchDate),
        deliveryDate: formatDate(item.deliveryDate),
        status: normalizeStatus(item.status),
      }));
  }, [rawTable, search, category]);

  if (loading || authLoading) {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Stock Items"
            value={formatNumber(toNumber(cards.totalStockItems))}
            icon={<Box size={24} className="text-[#2F80ED]" />}
          />

          <MetricCard
            label="Purchase Amount"
            value={formatMoney(toNumber(cards.purchaseAmount))}
            icon={<CircleDollarSign size={24} className="text-[#8B5CF6]" />}
          />

          <MetricCard
            label="Total Stock Value"
            value={formatMoney(toNumber(cards.totalStockValue))}
            icon={<CircleDollarSign size={24} className="text-[#8B5CF6]" />}
          />

          <MetricCard
            label="Transit Items"
            value={formatNumber(toNumber(cards.transitItems))}
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
              {monthlyChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChart}>
                    <defs>
                      <linearGradient
                        id="amountGradient"
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
                      fill="url(#amountGradient)"
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-[#94A3B8]">
                  No purchase chart data found
                </div>
              )}
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
                    data={agingData}
                    dataKey="value"
                    innerRadius={68}
                    outerRadius={105}
                    paddingAngle={7}
                    stroke="#fff"
                    strokeWidth={8}
                  >
                    {agingData.map((_, index) => (
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
              {agingData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-[12px] w-[12px]"
                    style={{
                      backgroundColor: ["#2F80ED", "#FF4D55", "#8B5CF6"][index],
                    }}
                  />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[22px] border border-[#E8EDF3] bg-white shadow-[0_1px_4px_rgba(16,24,40,0.08)]">
          <div className="flex flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-[390px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0AA]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by item..."
                className="h-[40px] w-full rounded-[12px] border border-transparent bg-[#F5F5F5] pl-11 pr-4 text-[13px] outline-none placeholder:text-[#A5A5A5]"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-[40px] rounded-[10px] border border-[#EEF2F7] bg-white px-4 text-[13px] text-[#333] outline-none"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="h-[370px]">
            <DraggableScroll>
              <table className="w-full min-w-[1180px] border-separate border-spacing-0">
                <thead className="sticky top-0 z-20">
                  <tr>
                    {[
                      "Item Name",
                      "Categories",
                      "HSN Code",
                      "GRN No.",
                      "Purchase Order No.",
                      "Current Stock",
                      "Stock IN",
                      "Stock OUT",
                      "Scrap",
                      "Dispatch Date",
                      "Delivery Date",
                      "Status",
                    ].map((head, index) => (
                      <th
                        key={head}
                        className={`h-[42px] border-b border-[#E5E7EB] bg-[#F1F1F1] px-4 text-left text-[12px] font-semibold text-[#111827] ${
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
                    tableRows.map((item, index) => (
                      <tr
                        key={`${item.itemName}-${index}`}
                        className="group bg-white"
                      >
                        <td className="sticky left-0 z-10 h-[43px] border-b border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#111827] group-hover:bg-[#FBFDFF]">
                          {item.itemName}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {item.categories}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {item.hsnCode}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {item.grnNo}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px] font-medium text-[#005EFF]">
                          {item.purchaseOrderNo}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {formatNumber(item.currentStock)}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {formatNumber(item.stockIn)}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {formatNumber(item.stockOut)}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {formatNumber(item.scrap)}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {item.dispatchDate}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[13px]">
                          {item.deliveryDate}
                        </td>

                        <td className="h-[43px] border-b border-[#E5E7EB] px-4 text-[12px]">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={12}
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