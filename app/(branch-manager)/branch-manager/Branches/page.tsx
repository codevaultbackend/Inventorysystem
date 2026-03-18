"use client";

import { useSuperDashboard } from "@/app/context/SuperDashboardContext";
import BranchOverviewPage from "./Component/BranchOverviewPage";
import BranchOverview from "../Dashboard/component/BranchOverview";
import { SalesTrendLine } from "./Component/SalesTrendLine";
import { StockTrendBar } from "./Component/StockTrendBar";

export default function BranchesPage() {
  const { data, loading } = useSuperDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-6">
      <BranchOverviewPage />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StockTrendBar />
        <SalesTrendLine />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BranchOverview />
      </div>
    </div>
  );
}