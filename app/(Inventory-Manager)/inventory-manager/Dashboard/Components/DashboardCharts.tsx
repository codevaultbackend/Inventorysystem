"use client";

import PurchaseAmountChart from "../Components/PurchaseAmountChart";

import StockStatusOverview from "../Components/StockStatusOverview";

type Props = {
  purchaseChartData: any[];

  stockStatusData: any[];
};

export default function DashboardCharts({
  purchaseChartData,
  stockStatusData,
}: Props) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-5
        xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]
      "
    >
      {/* PURCHASE CHART */}
      <div
        className="
          overflow-hidden
          rounded-[22px]
          border
          border-[#EAECF0]
          bg-white
          p-4
          shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)]
          sm:p-5
          xl:p-6
        "
      >
        <div className="h-[280px] sm:h-[320px] xl:h-[360px]">
          <PurchaseAmountChart
            data={purchaseChartData}
          />
        </div>
      </div>

      {/* STOCK STATUS */}
      <div
        className="
          overflow-hidden
          rounded-[22px]
          border
          border-[#EAECF0]
          bg-white
          p-4
          shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)]
          sm:p-5
          xl:p-6
        "
      >
        <div className="h-[300px] sm:h-[340px] xl:h-[360px]">
          <StockStatusOverview
            data={stockStatusData}
          />
        </div>
      </div>
    </div>
  );
}