"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BranchOverviewPage, { DashboardIcons } from "../../Component/BranchOverviewPage";
import { StockTrendBar } from "../../Component/StockTrendBar";
import { SalesTrendLine } from "../../Component/SalesTrendLine";
import HierarchyTable from "../../Component/HierarchyTable";
import { getBranchDashboard } from "@/app/lib/salesHierarchy";
import { formatCurrency, formatNumber } from "@/app/lib/salesDashboardApi";

export default function BranchPage() {
  const params = useParams();
  const branchId = String(params?.branchId || "");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        setLoading(true);
        setError("");
        const result = await getBranchDashboard(branchId);
        if (!ignore) setData(result);
      } catch (err: any) {
        if (!ignore) setError(err?.response?.data?.message || err?.message || "Failed to load branch dashboard");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (branchId) run();
    else {
      setLoading(false);
      setError("Branch not found");
    }

    return () => {
      ignore = true;
    };
  }, [branchId]);

  const cards = [
    {
      title: "Total Sales",
      value: data?.metrics?.[0]?.value || 0,
      icon: DashboardIcons.ShoppingCart,
      trend: "+12.5%",
      trendType: "up" as const,
    },
    {
      title: "Total Pending Quatation",
      value: data?.metrics?.[1]?.value || 0,
      icon: DashboardIcons.FileText,
      trend: "+12.5%",
      trendType: "up" as const,
    },
    {
      title: "Sales This Months",
      value: data?.metrics?.[2]?.value || 0,
      icon: DashboardIcons.Settings2,
      trend: "+12.5%",
      trendType: "down" as const,
    },
    {
      title: "Total Client",
      value: data?.metrics?.[3]?.value || 0,
      icon: DashboardIcons.Users,
    },
  ];

  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-6  pb-4 ">
      <div className="px-1 py-1">
        <h1 className="text-[30px] font-semibold leading-tight text-[#111827]">
          Branch Overview
        </h1>
        <p className="mt-1 text-[14px] text-[#98A2B3]">
          Detailed Branch Analytics and Sales Report
        </p>
      </div>

      <BranchOverviewPage cards={cards} loading={loading} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <StockTrendBar
          title="Pending & Rejected Quation"
          subtitle="Track sales and purchase trends"
          data={data?.stockTrend || []}
          loading={loading}
          leftLabel="Stock IN"
          rightLabel="Stock OUT"
          leftKey="stockIn"
          rightKey="stockOut"
        />
        <SalesTrendLine
          title="Quatation Tracking"
          subtitle="Track pending & reject quatation"
          data={data?.quotationTrend || []}
          loading={loading}
          leftKey="pending"
          rightKey="rejected"
          leftLabel="Pending Quatation"
          rightLabel="Reject Quatation"
        />
      </div>

      <HierarchyTable
        title="Branch Overview"
        subtitle="Latest System Activities and updates"
        data={data?.products || []}
        loading={loading}
        actionLabel="View"
        toolbarLabel="Weekly"
        getViewHref={(row) =>
          `/sales-manager/Branches/${encodeURIComponent(String(params?.state || ""))}/${encodeURIComponent(branchId)}/${encodeURIComponent(String(row.productName))}`
        }
        columns={[
          { key: "productName", title: "Product Name" },
          { key: "category", title: "Categoreies Name" },
          {
            key: "totalSales",
            title: "Total Sales",
            render: (row) => formatNumber(row.totalSales),
          },
          {
            key: "totalRevenue",
            title: "Total Revenuee",
            render: (row) => formatCurrency(row.totalRevenue),
          },
          {
            key: "clients",
            title: "No. of Clients",
            render: (row) => formatNumber(row.clients),
          },
          {
            key: "pendingQuotation",
            title: "Pending Quatation",
            render: (row) => formatNumber(row.pendingQuotation),
          },
          {
            key: "rejectedQuotation",
            title: "Rejection Quatation",
            render: (row) => formatNumber(row.rejectedQuotation),
          },
        ]}
      />
    </div>
  );
}