"use client";

import PurchaseAmountChart from "../Components/PurchaseAmountChart";
import StockStatusOverview from "../Components/StockStatusOverview";

export default function DashboardCharts({ purchaseChartData, stockStatusData }: any) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)] xl:gap-6">
      
      <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 lg:p-6">
        <div className="h-[280px] sm:h-[340px] lg:h-[400px] xl:h-[442px]">
          <PurchaseAmountChart data={purchaseChartData} />
        </div>
      </div>

      <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 lg:p-6">
        <div className="h-[300px] sm:h-[340px] lg:h-[400px] xl:h-[442px]">
          <StockStatusOverview data={stockStatusData} />
        </div>
      </div>

    </div>
  );
}