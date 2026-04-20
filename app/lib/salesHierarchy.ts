"use client";

import { salesDashboardApi, toNumber, formatWeekLabel } from "./salesDashboardApi";

export type MetricCardItem = {
  title: string;
  value: number;
  trend?: string;
  trendType?: "up" | "down";
};

export type ChartBarPoint = {
  week: string;
  stockIn: number;
  stockOut: number;
};

export type ChartLinePoint = {
  week: string;
  pending: number;
  rejected: number;
};

export type StateRow = {
  id: number | string;
  branchName: string;
  totalSales: number;
  totalRevenue: number;
  totalClients: number;
  pendingQuotation: number;
  rejectedQuotation: number;
};

export type ProductRow = {
  productName: string;
  category: string;
  totalSales: number;
  totalRevenue: number;
  clients: number;
  pendingQuotation: number;
  rejectedQuotation: number;
};

export type ItemTableRow = {
  date: string;
  aging: string;
  invoiceNumber: string;
  clientName: string;
  branch: string;
  qty: number;
  rate: number;
  amount: number;
  status: string;
};

export async function getOverviewDashboard() {
  const [dashboardRes, statesRes] = await Promise.allSettled([
    salesDashboardApi.get("/dashbord"),
    salesDashboardApi.get("/getstate"),
  ]);

  const dashboardData =
    dashboardRes.status === "fulfilled" ? dashboardRes.value.data : null;

  const statesData =
    statesRes.status === "fulfilled" ? statesRes.value.data : null;

  return {
    metrics: [
      {
        title: "Total Revenue",
        value: toNumber(
          dashboardData?.cards?.totalRevenue ??
            dashboardData?.summary?.totalRevenue ??
            dashboardData?.totalRevenue
        ),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Profit",
        value: toNumber(
          dashboardData?.cards?.totalProfit ??
            dashboardData?.summary?.totalProfit ??
            dashboardData?.totalProfit
        ),
        trend: "Months",
        trendType: "up" as const,
      },
      {
        title: "Total Sales",
        value: toNumber(
          dashboardData?.cards?.totalSales ??
            dashboardData?.summary?.totalSales ??
            dashboardData?.totalSales
        ),
        trend: "Day",
        trendType: "up" as const,
      },
      {
        title: "Total Branch",
        value: toNumber(
          dashboardData?.cards?.totalBranch ??
            dashboardData?.summary?.totalBranch ??
            dashboardData?.totalBranch
        ),
      },
    ],
    stockTrend: normalizeStockTrend(
      dashboardData?.charts?.stockTrend ||
        dashboardData?.stockTrend ||
        dashboardData?.barChart ||
        []
    ),
    quotationTrend: normalizeQuotationTrend(
      dashboardData?.charts?.quotationTrend ||
        dashboardData?.quotationTrend ||
        dashboardData?.lineChart ||
        []
    ),
    states:
      normalizeStatesOrBranches(
        statesData?.states || statesData?.data || statesData || []
      ) || [],
  };
}

export async function getStateDashboard(state: string) {
  const res = await salesDashboardApi.get(`/getstate/${encodeURIComponent(state)}`);
  const data = res.data || {};

  return {
    title: data?.state || state,
    metrics: [
      {
        title: "Total Sales",
        value: toNumber(data?.cards?.totalSales),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Pending Quatation",
        value: toNumber(data?.cards?.pendingQuotation),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Sales This Months",
        value: toNumber(data?.cards?.salesThisMonth),
        trend: "+12.5%",
        trendType: "down" as const,
      },
      {
        title: "Total Client",
        value: toNumber(data?.cards?.totalClients),
      },
    ],
    stockTrend: normalizeStockTrend(data?.charts?.stockTrend || []),
    quotationTrend: normalizeQuotationTrend(data?.charts?.quotationTrend || []),
    branches: normalizeStatesOrBranches(data?.branches || []),
  };
}

export async function getBranchDashboard(branchId: string | number) {
  const res = await salesDashboardApi.get(`/branch/${encodeURIComponent(String(branchId))}`);
  const data = res.data || {};

  return {
    metrics: [
      {
        title: "Total Sales",
        value: toNumber(data?.cards?.totalSales),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Pending Quatation",
        value: toNumber(data?.cards?.pendingQuotation),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Sales This Months",
        value: toNumber(data?.cards?.salesThisMonth),
        trend: "+12.5%",
        trendType: "down" as const,
      },
      {
        title: "Total Client",
        value: toNumber(data?.cards?.totalClients),
      },
    ],
    stockTrend: normalizeStockTrend(data?.charts?.stockTrend || []),
    quotationTrend: normalizeQuotationTrend(data?.charts?.quotationTrend || []),
    products: normalizeProducts(data?.products || []),
  };
}

export async function getItemDashboard(itemId: string | number) {
  const res = await salesDashboardApi.get(
    `/dashboard/item/${encodeURIComponent(String(itemId))}`
  );
  const data = res.data || {};

  return {
    item: data?.item || "Item",
    category: data?.category || "",
    metrics: [
      {
        title: "Total Quantity Sold",
        value: toNumber(data?.cards?.totalQty),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Available Stock Value",
        value: toNumber(data?.cards?.stockValue),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Revenue",
        value: toNumber(data?.cards?.totalRevenue),
        trend: "+12.5%",
        trendType: "up" as const,
      },
      {
        title: "Total Invoice",
        value: toNumber(data?.cards?.totalInvoices),
        trend: "+12.5%",
        trendType: "up" as const,
      },
    ],
    stockTrend: normalizeItemStockTrend(data?.charts?.stockTrend || []),
    revenueTrend: normalizeRevenueTrend(data?.charts?.revenueTrend || []),
    table: normalizeItemTable(data?.table || []),
  };
}

function normalizeStockTrend(rows: any[]): ChartBarPoint[] {
  return (rows || []).map((row, index) => ({
    week: formatWeekLabel(row?.week, index),
    stockIn: toNumber(row?.stockIn ?? row?.stockin ?? row?.sales ?? row?.profit),
    stockOut: toNumber(row?.stockOut ?? row?.stockout ?? row?.purchase ?? row?.loss),
  }));
}

function normalizeQuotationTrend(rows: any[]): ChartLinePoint[] {
  return (rows || []).map((row, index) => ({
    week: formatWeekLabel(row?.week, index),
    pending: toNumber(row?.pending),
    rejected: toNumber(row?.rejected),
  }));
}

function normalizeRevenueTrend(rows: any[]) {
  return (rows || []).map((row, index) => ({
    week: formatWeekLabel(row?.week, index),
    revenue: toNumber(row?.revenue),
    cost: toNumber(row?.cost),
  }));
}

function normalizeStatesOrBranches(rows: any[]): StateRow[] {
  return (rows || []).map((row) => ({
    id: row?.id,
    branchName: row?.branchName || row?.stateName || row?.name || "-",
    totalSales: toNumber(row?.totalSales),
    totalRevenue: toNumber(row?.totalRevenue),
    totalClients: toNumber(row?.totalClients),
    pendingQuotation: toNumber(row?.pendingQuotation),
    rejectedQuotation: toNumber(row?.rejectedQuotation),
  }));
}

function normalizeProducts(rows: any[]): ProductRow[] {
  return (rows || []).map((row) => ({
    productName: row?.productName || "-",
    category: row?.category || "-",
    totalSales: toNumber(row?.totalSales),
    totalRevenue: toNumber(row?.totalRevenue),
    clients: toNumber(row?.clients),
    pendingQuotation: toNumber(row?.pendingQuotation),
    rejectedQuotation: toNumber(row?.rejectedQuotation),
  }));
}

function normalizeItemStockTrend(rows: any[]) {
  return (rows || []).map((row, index) => ({
    week: formatWeekLabel(row?.week, index),
    sales: toNumber(row?.sales),
    purchase: toNumber(row?.purchase),
  }));
}

function normalizeItemTable(rows: any[]): ItemTableRow[] {
  return (rows || []).map((row) => ({
    date: row?.date || "-",
    aging: row?.aging || "-",
    invoiceNumber: row?.invoiceNumber || "-",
    clientName: row?.clientName || "-",
    branch: row?.branch || "-",
    qty: toNumber(row?.qty),
    rate: toNumber(row?.rate),
    amount: toNumber(row?.amount),
    status: row?.status || "-",
  }));
}