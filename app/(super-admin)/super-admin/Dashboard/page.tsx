"use client";

import BranchOverview from "./component/BranchOverview";
import DashboardStats from "./component/CountCards";
import RecentActivities from "./component/RecentActivities";
import SalesAnalytics from "./component/SalesAnalytics";
import StockDistribution from "./component/StockDistribution";
import { useSuperDashboard } from "../../../context/SuperDashboardContext";

type SalesChartItem = {
  day: string;
  fullDate: string;
  sales: number;
  purchase: number;
};

type StockDistributionItem = {
  name: string;
  value: number;
  total: number;
  color: string;
};

type BranchItem = {
  name: string;
  id: string;
  stock: number;
  purchase: number;
  sales: number;
  in: number;
  out: number;
};

type ActivityItem = {
  title: string;
  description: string;
  time: string;
  type: string;
};

const STOCK_COLORS = [
  "#3B82F6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#EAB308",
];

function toNumber(value: any) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatDateLabel(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function buildSalesAnalyticsData(
  salesList: any[] = [],
  purchaseList: any[] = []
): SalesChartItem[] {
  const mergedMap = new Map<string, SalesChartItem>();

  salesList.forEach((item) => {
    const date = item?.date;
    if (!date) return;

    if (!mergedMap.has(date)) {
      mergedMap.set(date, {
        day: formatDateLabel(date),
        fullDate: date,
        sales: 0,
        purchase: 0,
      });
    }

    mergedMap.get(date)!.sales = toNumber(item?.total);
  });

  purchaseList.forEach((item) => {
    const date = item?.date;
    if (!date) return;

    if (!mergedMap.has(date)) {
      mergedMap.set(date, {
        day: formatDateLabel(date),
        fullDate: date,
        sales: 0,
        purchase: 0,
      });
    }

    mergedMap.get(date)!.purchase = toNumber(item?.total);
  });

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useSuperDashboard();

  const salesList = Array.isArray(data?.salesAnalytics?.sales)
    ? data.salesAnalytics.sales
    : [];

  const purchaseList = Array.isArray(data?.salesAnalytics?.purchase)
    ? data.salesAnalytics.purchase
    : [];

  const salesAnalyticsData: SalesChartItem[] = buildSalesAnalyticsData(
    salesList,
    purchaseList
  );

  const stockDistributionData: StockDistributionItem[] = Array.isArray(
    data?.stockDistribution
  )
    ? data.stockDistribution.map((item: any, index: number) => ({
        name: item.category || item.name || `Category ${index + 1}`,
        value: toNumber(item.percentage ?? item.value ?? 0),
        total: toNumber(item.total ?? 0),
        color: STOCK_COLORS[index % STOCK_COLORS.length],
      }))
    : [];

  const branchOverviewData: BranchItem[] = Array.isArray(data?.branchOverview)
    ? data.branchOverview.map((item: any, index: number) => ({
        name: item.branchName || item.name || `Branch ${index + 1}`,
        id: String(
          item.id ?? item.branchId ?? item.branch_id ?? `branch-${index + 1}`
        ),
        stock: toNumber(item.stockItems ?? item.stock_items ?? item.stock ?? 0),
        purchase: toNumber(item.purchase ?? 0),
        sales: toNumber(item.sale ?? item.sales ?? 0),
        in: toNumber(item.stockIn ?? item.in ?? 0),
        out: toNumber(item.stockOut ?? item.out ?? 0),
      }))
    : [];

  const recentActivitiesData: ActivityItem[] = Array.isArray(
    data?.recentActivities
  )
    ? data.recentActivities.map((item: any) => ({
        title: item.title || "Activity",
        description: item.description || "System update",
        time: item.time || item.createdAt || item.date || "",
        type: item.type || "default",
      }))
    : [];

  if (error && !loading) {
    return (
      <div className="rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <DashboardStats data={data} loading={loading} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(660px,0.95fr)]">
        <div className="min-w-0">
          <SalesAnalytics data={salesAnalyticsData} loading={loading} />
        </div>

        <div className="min-w-0">
          <StockDistribution data={stockDistributionData} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <div className="min-w-0">
          <BranchOverview data={branchOverviewData} loading={loading} />
        </div>

        <div className="min-w-0">
          <RecentActivities data={recentActivitiesData} loading={loading} />
        </div>
      </div>
    </div>
  );
}