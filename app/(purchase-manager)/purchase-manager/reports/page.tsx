import SalesTrendChart from "./components/SalesTrendChart";
import ScrapRepairChart from "./components/ScrapRepairChart";
import TransitDonutChart from "./components/TransitDonutChart";
import ReportsTable from "./components/ReportsTable";

export default function Reports() {
  return (
    <div className="space-y-6">

      <SalesTrendChart />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ScrapRepairChart />
        <TransitDonutChart />
      </div>

      <ReportsTable />

    </div>
  );
}
