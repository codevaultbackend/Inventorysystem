import ReportFilterBar from "./components/FilterBar";
import ProductCatChart from "./components/ProductCatChart";
import Profit from "./components/Profit";
import RecentTransactions from "./components/RecentTransactions";
import ReportState from "./components/ReportState";
import RevenueChart from "./components/RevanueChart";
import TopSelling from "./components/TopSelling";
import WeeklyActivity from "./components/WeeklyActivity";
import InventoryStatus from "./components/InventorySatus";
import ClientBreakDown from "./components/ClientBreakDown";
import QuickStatus from "./components/QuickStatus";

export default function ReportAnalysis() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Filter */}
      <ReportFilterBar />

      {/* Stats */}
      <ReportState />

      {/* Revenue + Product Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <ProductCatChart />
      </div>

      {/* Weekly + Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyActivity />
        <Profit />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSelling />
        <RecentTransactions />
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <InventoryStatus />
        <ClientBreakDown />
        <QuickStatus />
      </div>

    </div>
  );
}