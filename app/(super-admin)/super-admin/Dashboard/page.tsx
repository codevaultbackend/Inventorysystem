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
  href?: string;
};

type ActivityItem = {
  title: string;
  description: string;
  time: string;
  type: string;
};

const STOCK_COLORS = [
  "#2563EB",
  "#F97316",
  "#38BDF8",
  "#8BC34A",
  "#D946EF",
  "#14B8A6",
  "#F59E0B",
  "#7C3AED",
];

function toNumber(value: unknown) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[₹,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatDateLabel(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
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

    mergedMap.get(date)!.sales = toNumber(item?.total ?? item?.sales);
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

    mergedMap.get(date)!.purchase = toNumber(item?.total ?? item?.purchase);
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
    ? data.branchOverview.map((item: any, index: number) => {
        const resolvedName =
          item.state ||
          item.branchName ||
          item.name ||
          `State ${index + 1}`;

        const resolvedId = String(
          item.id ??
            item.stateId ??
            item.state_id ??
            item.branchId ??
            item.branch_id ??
            index + 1
        );

        return {
          id: resolvedId,
          name: resolvedName,
          stock: toNumber(item.totalStock ?? item.stock ?? item.stockItems ?? 0),
          purchase: toNumber(item.purchaseCount ?? item.purchase ?? 0),
          sales: toNumber(item.salesCount ?? item.sales ?? item.sale ?? 0),
          in: toNumber(item.currentStock ?? item.in ?? item.stockIn ?? 0),
          out: toNumber(item.out ?? item.stockOut ?? 0),
          href: `/super-admin/Branches/${encodeURIComponent(resolvedName)}`,
        };
      })
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
      <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section className="w-full space-y-5 xl:space-y-4">
      <DashboardStats data={data} loading={loading} />

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(430px,1fr)]">
        <SalesAnalytics data={salesAnalyticsData} loading={loading} />
        <StockDistribution data={stockDistributionData} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <BranchOverview data={branchOverviewData} loading={loading} />
        <RecentActivities data={recentActivitiesData} loading={loading} />
      </div>
    </section>
  );
}