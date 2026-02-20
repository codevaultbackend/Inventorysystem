"use client";
import { useSuperDashboard } from '@/app/context/SuperDashboardContext';
import BranchoverwiewPage from '../../super-admin/Branches/Component/BranchOverviewPage'
import BranchOverview from '../Dashboard/component/BranchOverview';
import { SalesTrendLine } from './Component/SalesTrendLine';
import { StockTrendBar } from './Component/StockTrendBar';



export default function Branches() {

  const { data, loading } = useSuperDashboard()

  return (
    <div className="space-y-6 mb-[16px]">
      <BranchoverwiewPage />
      <div className="grid xl:grid-cols-2 sm:grid-cols-1 max-[768px]:grid-cols-1 justify-between gap-[16px]">
        <StockTrendBar />
        <SalesTrendLine />
      </div>
      <div className="flex xl:grid-cols-2 sm:grid-cols-1 justify-between gap-[16px]">
        <BranchOverview />
      </div>
    </div>
  );
}
