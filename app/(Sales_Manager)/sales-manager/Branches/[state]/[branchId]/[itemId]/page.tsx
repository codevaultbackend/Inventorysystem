"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BranchOverviewPage, {
  DashboardIcons,
} from "../../../Component/BranchOverviewPage";
import { StockTrendBar } from "../../../Component/StockTrendBar";
import { SalesTrendLine } from "../../../Component/SalesTrendLine";
import HierarchyTable from "../../../Component/HierarchyTable";
import { getItemDashboard } from "@/app/lib/salesHierarchy";
import {
  formatCurrency,
  formatDateCell,
  formatNumber,
} from "@/app/lib/salesDashboardApi";

function extractNumericItemId(value: string): number | null {
  if (!value) return null;

  if (/^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  const match = value.match(/(\d+)(?!.*\d)/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function ItemPage() {
  const params = useParams();
  const rawItemId = String(params?.itemId || "");
  const normalizedItemId = useMemo(
    () => extractNumericItemId(rawItemId),
    [rawItemId]
  );

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        if (!rawItemId) {
          throw new Error("Item not found");
        }

        if (!normalizedItemId) {
          throw new Error(`Invalid item id: ${rawItemId}`);
        }

        const result = await getItemDashboard(normalizedItemId);

        if (!ignore) setData(result);
      } catch (err: any) {
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load item dashboard"
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, [rawItemId, normalizedItemId]);

  const cards = [
    {
      title: "Total Quantity Sold",
      value: data?.metrics?.[0]?.value || 0,
      icon: DashboardIcons.ShoppingCart,
      trend: "+12.5%",
      trendType: "up" as const,
    },
    {
      title: "Available Stock Value",
      value: data?.metrics?.[1]?.value || 0,
      icon: DashboardIcons.Boxes,
      trend: "+12.5%",
      trendType: "up" as const,
    },
    {
      title: "Total Revenue",
      value: data?.metrics?.[2]?.value || 0,
      icon: DashboardIcons.IndianRupee,
      trend: "+12.5%",
      trendType: "up" as const,
    },
    {
      title: "Total Invoice",
      value: data?.metrics?.[3]?.value || 0,
      icon: DashboardIcons.FileText,
      trend: "+12.5%",
      trendType: "up" as const,
    },
  ];

  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-6  pb-4 ">
      <div className="px-1 py-1">
        <h1 className="text-[30px] font-semibold leading-tight text-[#111827]">
          {data?.item || "Product"}
          {data?.category ? ` , ${data.category}` : ""}
        </h1>
        <p className="mt-1 text-[14px] text-[#98A2B3]">
          Comprehensive item analysis and tracking
        </p>
      </div>

      <BranchOverviewPage cards={cards} loading={loading} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <StockTrendBar
          title="Stock IN & OUT Movement"
          subtitle="Track sales and purchase trends"
          data={data?.stockTrend || []}
          loading={loading}
          leftLabel="Sales"
          rightLabel="Purchase"
          leftKey="sales"
          rightKey="purchase"
        />
        <SalesTrendLine
          title="Revenue & Cost Trends"
          subtitle="Track sales and purchase trends"
          data={data?.revenueTrend || []}
          loading={loading}
          leftKey="revenue"
          rightKey="cost"
          leftLabel="Revenue"
          rightLabel="Cost"
        />
      </div>

      <HierarchyTable
        title="Product Analysis"
        subtitle="Freshness Status"
        data={data?.table || []}
        loading={loading}
        hideAction
        columns={[
          {
            key: "date",
            title: "Date",
            render: (row) => formatDateCell(row.date),
          },
          { key: "invoiceNumber", title: "Invoice Number" },
          { key: "clientName", title: "Client Name" },
          { key: "branch", title: "Branch" },
          {
            key: "qty",
            title: "Qty",
            render: (row) => formatNumber(row.qty),
          },
          {
            key: "rate",
            title: "Rate",
            render: (row) => formatCurrency(row.rate),
          },
          {
            key: "amount",
            title: "Amount",
            render: (row) => formatCurrency(row.amount),
          },
          {
            key: "status",
            title: "Status",
          },
        ]}
      />
    </div>
  );
}