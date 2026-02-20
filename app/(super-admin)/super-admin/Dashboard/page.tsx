"use client";

import BranchOverview from "./component/BranchOverview";
import DashboardStats from "./component/CountCards";
import RecentActivities from "./component/RecentActivities";
import SalesAnalytics from "./component/SalesAnalytics";
import StockDistribution from "./component/StockDistribution";

import { useSuperDashboard } from "../../../context/SuperDashboardContext";

export default function DashboardPage() {
  const { data, loading } = useSuperDashboard();

  return (
    <div className="space-y-6 mb-[16px]">
      <DashboardStats data={data} loading={loading} />

      <div className="grid xl:grid-cols-2 sm:grid-cols-1 grid-cols-1 justify-between gap-[16px]">
        <SalesAnalytics />
        <StockDistribution  />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 sm:grid-cols-1 justify-between gap-[16px]">
        <BranchOverview data={data} loading={loading}   />
        <RecentActivities  />
      </div>
    </div>
  );
}
