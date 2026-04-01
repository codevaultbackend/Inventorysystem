"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  ShoppingCart,
  TrendingUp,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

type DashboardResponse = {
  success: boolean;
  quickAction: {
    todaySale: number;
    totalSale: string | number;
    pendingQuotation: string | number;
    readyToDispatch: string | number;
    totalOrders?: string | number;
  };

  salesAnalytics?: {
    month: string;
    onlinesales?: number;
    offlinesales?: number;
    onlineSales?: number;
    offlineSales?: number;
  }[];

  globalSalesAnalytics?: {
    month: string;
    monthDate?: string;
    onlinesales?: number;
    offlinesales?: number;
    onlineSales?: number;
    offlineSales?: number;
  }[];

  quotationStatus?: {
    pending: string | number;
    approved: string | number;
    rejected: string | number;
    invoiced: string | number;
    totalvalue?: number;
    totalValue?: number;
  };

  globalQuotationStatus?: {
    pending: string | number;
    approved: string | number;
    rejected: string | number;
    invoiced: string | number;
    totalvalue?: number;
    totalValue?: number;
  };

  categorySales?: {
    category: string;
    units: string | number;
    revenue: number;
  }[];

  globalCategorySales?: {
    category: string;
    units: string | number;
    revenue: number;
  }[];

  recentActivity?: {
    quotation_no: string;
    client: string | null;
    total_amount: number;
    status: string;
    createdAt: string;
  }[];

  globalRecentActivity?: {
    quotation_no: string;
    client: string | null;
    total_amount: number;
    status: string;
    createdAt: string;
  }[];
};

type QuickStatCardProps = {
  topText: string;
  bigValue: string;
  bottomLabel: string;
  icon: React.ReactNode;
  circleBg: string;
  iconColor: string;
};

function toNumber(value: number | string | undefined | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function formatCompactNumber(value: number | string) {
  const num = toNumber(value);
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

function formatAmount(value: number | string, withCurrency = true) {
  const num = toNumber(value);
  return new Intl.NumberFormat("en-IN", {
    style: withCurrency ? "currency" : "decimal",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDateTime(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(status: string) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return "bg-[#EAF8EF] text-[#16A34A]";
  if (s === "rejected") return "bg-[#FFF1F2] text-[#EF4444]";
  if (s === "invoiced") return "bg-[#EEF2FF] text-[#4F46E5]";
  return "bg-[#FFF7ED] text-[#F59E0B]";
}

function QuickStatCard({
  topText,
  bigValue,
  bottomLabel,
  icon,
  circleBg,
  iconColor,
}: QuickStatCardProps) {
  return (
    <div
      className="
        group relative min-h-[154px] overflow-hidden
        rounded-[26px] border border-[#E7ECF2] bg-white
        px-[16px] pb-[14px] pt-[16px]
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_18px_rgba(16,24,40,0.06)]
        transition-all duration-200
        hover:shadow-[0_2px_6px_rgba(16,24,40,0.06),0_14px_28px_rgba(16,24,40,0.08)]
        sm:px-[18px] sm:pb-[16px] sm:pt-[16px]
        xl:min-h-[156px]
      "
      style={{ borderRadius: "24px" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95),rgba(255,255,255,0))]" />

      <div className="flex h-full flex-col">
        <div
          className="
            mb-[18px] flex h-[50px] w-[50px] items-center justify-center
            rounded-[14px] border border-[#EEF2F6] bg-[#F4F7FB]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]
          "
        >
          <span className={iconColor}>{icon}</span>
        </div>

        <div className="mt-auto">
          <p className="mb-[6px] line-clamp-1 text-[13px] font-medium leading-[20px] tracking-[-0.01em] text-[#98A2B3]">
            {topText}
          </p>

          <div className="min-w-0">
            <h3 className="truncate text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111827] sm:text-[30px] xl:text-[29px]">
              {bigValue}
            </h3>

            <p className="mt-[8px] line-clamp-1 text-[14px] font-medium leading-[20px] tracking-[-0.01em] text-[#98A2B3]">
              {bottomLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomLineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const offline =
    payload.find((p: any) => p.dataKey === "offlinesales")?.value || 0;
  const online =
    payload.find((p: any) => p.dataKey === "onlinesales")?.value || 0;
  const total = Number(offline) + Number(online);

  return (
    <div className="rounded-[14px] bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.14)]">
      <div className="text-[12px] font-medium text-[#98A2B3]">{label} 2026</div>
      <div className="mt-1 text-[22px] font-semibold text-[#111827]">
        {formatAmount(total)}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="
        relative min-h-[154px] overflow-hidden rounded-[26px]
        border border-[#E7ECF2] bg-white
        px-[16px] pb-[14px] pt-[16px]
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_18px_rgba(16,24,40,0.06)]
        sm:px-[18px] sm:pb-[16px] sm:pt-[16px]
      "
      style={{ borderRadius: "24px" }}
    >
      <div className="flex h-full flex-col">
        <div className="mb-[18px] h-[50px] w-[50px] rounded-[14px] border border-[#EEF2F6] bg-[#F4F7FB]" />

        <div className="mt-auto">
          <div className="mb-[6px] h-[18px] w-[84px] rounded bg-[#E5E7EB]" />
          <div className="h-[32px] w-[132px] rounded bg-[#E5E7EB]" />
          <div className="mt-[8px] h-[18px] w-[110px] rounded bg-[#E5E7EB]" />
        </div>
      </div>
    </div>
  );
}

function SkeletonChartCard({
  title,
  height = "h-[280px]",
}: {
  title: string;
  height?: string;
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-[#E6EBF2] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="h-6 w-40 rounded bg-[#E5E7EB]" />
        <div className="h-8 w-24 rounded-[10px] bg-[#E5E7EB]" />
      </div>
      <div className={`w-full rounded-[14px] bg-[#F8FAFC] ${height}`}>
        <div className="flex h-full items-end justify-between gap-3 p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-full rounded-t-[10px] bg-[#E5E7EB]"
              style={{ height: `${35 + (i % 4) * 15}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonPieCard() {
  return (
    <div className="rounded-[18px] border border-[#E6EBF2] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-40 rounded bg-[#E5E7EB]" />
        <div className="h-5 w-5 rounded bg-[#E5E7EB]" />
      </div>

      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative h-[220px] w-[220px]">
          <div className="absolute inset-0 rounded-full border-[24px] border-[#E5E7EB]" />
          <div className="absolute inset-[52px] rounded-full border border-[#E5E7EB] bg-white" />
        </div>

        <div className="mt-3 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-[8px] w-[8px] rounded-full bg-[#E5E7EB]" />
              <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonRecentActivity() {
  return (
    <div className="rounded-[18px] border border-[#E6EBF2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#EEF2F6] px-4 py-5">
        <div className="h-6 w-36 rounded bg-[#E5E7EB]" />
      </div>

      <div className="space-y-3 px-3 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[14px] border border-[#EEF2F6] bg-[#FCFDFE] px-3 py-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="h-4 w-28 rounded bg-[#E5E7EB]" />
                <div className="mt-2 h-4 w-32 rounded bg-[#E5E7EB]" />
                <div className="mt-2 h-3 w-24 rounded bg-[#E5E7EB]" />
              </div>
              <div className="w-[110px]">
                <div className="ml-auto h-4 w-24 rounded bg-[#E5E7EB]" />
                <div className="mt-2 ml-auto h-6 w-20 rounded-full bg-[#E5E7EB]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalesManagerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        if (!baseUrl) {
          setError("API base URL is missing.");
          return;
        }

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") ||
              localStorage.getItem("token") ||
              localStorage.getItem("authToken")
            : null;

        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;

        const res = await axios.get(`${baseUrl}/sales/dashbord`, { headers });
        setDashboard(res.data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(
          err?.response?.status === 403
            ? "You are not authorized to view this dashboard."
            : err?.response?.data?.message ||
                err?.message ||
                "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [baseUrl]);

  const quickAction = dashboard?.quickAction;

  const quotationStatus =
    dashboard?.quotationStatus || dashboard?.globalQuotationStatus;

  const salesAnalyticsRaw =
    dashboard?.salesAnalytics?.length
      ? dashboard.salesAnalytics
      : dashboard?.globalSalesAnalytics?.length
      ? dashboard.globalSalesAnalytics
      : [];

  const salesAnalytics = salesAnalyticsRaw.length
    ? salesAnalyticsRaw.map((item) => ({
        month: item.month,
        onlinesales: toNumber(item.onlinesales ?? item.onlineSales ?? 0),
        offlinesales: toNumber(item.offlinesales ?? item.offlineSales ?? 0),
      }))
    : [{ month: "Mar", onlinesales: 0, offlinesales: 0 }];

  const categorySales =
    dashboard?.categorySales?.length
      ? dashboard.categorySales
      : dashboard?.globalCategorySales || [];

  const recentActivity =
    dashboard?.recentActivity?.length
      ? dashboard.recentActivity
      : dashboard?.globalRecentActivity || [];

  const totalQuotations = useMemo(() => {
    if (!quotationStatus) return 0;
    return (
      toNumber(quotationStatus.pending) +
      toNumber(quotationStatus.approved) +
      toNumber(quotationStatus.rejected) +
      toNumber(quotationStatus.invoiced)
    );
  }, [quotationStatus]);

  const quoteChartData = useMemo(() => {
    if (!quotationStatus) return [];

    const data = [
      {
        name: "Pending",
        value: toNumber(quotationStatus.pending),
        color: "#2C2F73",
      },
      {
        name: "Approved",
        value: toNumber(quotationStatus.approved),
        color: "#F59E1B",
      },
      {
        name: "Rejected",
        value: toNumber(quotationStatus.rejected),
        color: "#F58B8E",
      },
      {
        name: "Invoiced",
        value: toNumber(quotationStatus.invoiced),
        color: "#B8C7FF",
      },
    ];

    return data.filter((item) => item.value > 0);
  }, [quotationStatus]);

  const categoryChartData = useMemo(() => {
    return categorySales.map((item) => ({
      name: item.category,
      revenue: toNumber(item.revenue),
      units: toNumber(item.units),
    }));
  }, [categorySales]);

  const quickCards = useMemo(() => {
    return [
      {
        topText: formatAmount(quickAction?.todaySale || 0),
        bigValue:
          toNumber(quickAction?.todaySale || 0) > 0
            ? formatCompactNumber(quickAction?.todaySale || 0)
            : "0",
        bottomLabel: "Today’s Sale",
        circleBg: "bg-[#DDF3EC]",
        iconColor: "text-[#8CCFC2]",
        icon: <ShoppingCart size={22} />,
      },
      {
        topText: `${categorySales.length} items`,
        bigValue: formatAmount(quickAction?.totalSale || 0),
        bottomLabel: "Total Sale",
        circleBg: "bg-[#DCE3FA]",
        iconColor: "text-[#88A3F8]",
        icon: <TrendingUp size={22} />,
      },
      {
        topText: `${toNumber(quickAction?.pendingQuotation)} pending`,
        bigValue: formatAmount(quickAction?.pendingQuotation || 0),
        bottomLabel: "Pending Quotation",
        circleBg: "bg-[#F8DED3]",
        iconColor: "text-[#F09776]",
        icon: <FileText size={22} />,
      },
      {
        topText: `${toNumber(quickAction?.readyToDispatch)} on schedule`,
        bigValue: `${toNumber(quickAction?.readyToDispatch)}`,
        bottomLabel: "Ready to Dispatch",
        circleBg: "bg-[#F2D7DE]",
        iconColor: "text-[#E76C8D]",
        icon: <Truck size={22} />,
      },
    ];
  }, [quickAction, categorySales.length]);

  if (error || (!loading && !dashboard)) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex min-h-[420px] max-w-[1380px] items-center justify-center rounded-[24px] border border-[#E4E7EC] bg-white p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-[22px] font-semibold text-[#111827]">
              Dashboard unavailable
            </h2>
            <p className="mt-3 text-[15px] text-[#667085]">
              {error || "Unable to load data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-1">
      <div className="mx-auto max-w-[1380px]">
        <section
          className={`rounded-[18px] p-1 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${
            loading ? "animate-pulse" : ""
          }`}
        >
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : quickCards.map((item) => (
                  <QuickStatCard
                    key={item.bottomLabel}
                    topText={item.topText}
                    bigValue={item.bigValue}
                    bottomLabel={item.bottomLabel}
                    circleBg={item.circleBg}
                    iconColor={item.iconColor}
                    icon={item.icon}
                  />
                ))}
          </div>
        </section>

        <section
          className={`mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px] ${
            loading ? "animate-pulse" : ""
          }`}
        >
          {loading ? (
            <>
              <SkeletonChartCard
                title="Sales Analytics"
                height="h-[280px] sm:h-[305px]"
              />
              <SkeletonPieCard />
            </>
          ) : (
            <>
              <div className="min-w-0 rounded-[18px] border border-[#E6EBF2] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h3 className="text-[18px] font-semibold text-[#111827]">
                    Sales Analytics
                  </h3>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex items-center gap-2 text-[13px] font-medium text-[#111827]">
                        <span className="h-[8px] w-[8px] rounded-full bg-[#232663]" />
                        Offline orders
                      </div>
                      <div className="flex items-center gap-2 text-[13px] font-medium text-[#111827]">
                        <span className="h-[8px] w-[8px] rounded-full bg-[#F39B13]" />
                        Online orders
                      </div>
                    </div>

                    <button className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-white px-3 text-[13px] font-medium text-[#374151] shadow-sm">
                      Monthly
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                <div className="h-[280px] w-full sm:h-[305px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesAnalytics}
                      margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="#E7EDF5"
                        strokeDasharray="0"
                      />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#98A2B3", fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#98A2B3", fontSize: 12 }}
                        tickFormatter={(v) =>
                          v >= 100000
                            ? `${Math.round(v / 100000)}L`
                            : v >= 1000
                            ? `${Math.round(v / 1000)}K`
                            : `${v}`
                        }
                      />
                      <Tooltip content={<CustomLineTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="offlinesales"
                        stroke="#232663"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="onlinesales"
                        stroke="#F39B13"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[18px] border border-[#E6EBF2] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[18px] font-semibold text-[#111827]">
                    Quotation Status
                  </h3>

                  <button className="inline-flex items-center justify-center text-[#98A2B3]">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative h-[220px] w-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={quoteChartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={68}
                          outerRadius={98}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {quoteChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                        <div className="text-center text-[16px] font-semibold text-[#374151]">
                          {formatAmount(
                            quotationStatus?.totalvalue ??
                              quotationStatus?.totalValue ??
                              0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid w-full grid-cols-1 gap-2 text-[13px] font-medium text-[#374151] sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <span className="h-[8px] w-[8px] rounded-full bg-[#2C2F73]" />
                      Pending ({toNumber(quotationStatus?.pending)})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-[8px] w-[8px] rounded-full bg-[#F59E1B]" />
                      Approved ({toNumber(quotationStatus?.approved)})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-[8px] w-[8px] rounded-full bg-[#F58B8E]" />
                      Rejected ({toNumber(quotationStatus?.rejected)})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-[8px] w-[8px] rounded-full bg-[#B8C7FF]" />
                      Invoiced ({toNumber(quotationStatus?.invoiced)})
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section
          className={`mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px] ${
            loading ? "animate-pulse" : ""
          }`}
        >
          {loading ? (
            <>
              <SkeletonChartCard
                title="Sales by Category ( Units Sold )"
                height="h-[360px]"
              />
              <SkeletonRecentActivity />
            </>
          ) : (
            <>
              <div className="min-w-0 rounded-[18px] border border-[#E6EBF2] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] max-h-[430px]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-semibold text-[#111827]">
                    Sales by Category ( Units Sold )
                  </h3>

                  <button className="inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B]">
                    Monthly
                    <ChevronDown size={16} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="h-[360px] min-w-[720px] pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryChartData}
                        margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="#E7EDF5"
                          strokeDasharray="0"
                        />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#98A2B3", fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#98A2B3", fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value: any) => [value, "Units"]}
                          cursor={{ fill: "rgba(15,23,42,0.04)" }}
                        />
                        <Bar
                          dataKey="units"
                          fill="#2C2F73"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={56}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-[18px] max-h-[430px] overflow-y-auto border border-[#E6EBF2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between border-b border-[#EEF2F6] px-4 py-5">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-[#667085]" />
                    <h3 className="text-[18px] font-semibold text-[#111827]">
                      Recent Activity
                    </h3>
                  </div>

                  <button className="inline-flex items-center justify-center text-[#98A2B3]">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="space-y-3 px-3 py-3">
                  {recentActivity.length === 0 ? (
                    <div className="rounded-[14px] border border-[#EEF2F6] bg-[#FCFDFE] px-4 py-6 text-center text-[14px] text-[#667085]">
                      No recent activity found.
                    </div>
                  ) : (
                    recentActivity.slice(0, 6).map((item, index) => (
                      <div
                        key={`${item.quotation_no}-${index}`}
                        className="rounded-[14px] border border-[#EEF2F6] bg-[#FCFDFE] px-3 py-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-[#111827]">
                              {item.quotation_no}
                            </p>
                            <p className="mt-1 truncate text-[14px] text-[#667085]">
                              {item.client || "No client name"}
                            </p>
                            <p className="mt-1 text-[12px] text-[#98A2B3]">
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[14px] font-semibold text-[#111827]">
                              {formatAmount(item.total_amount)}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${statusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}