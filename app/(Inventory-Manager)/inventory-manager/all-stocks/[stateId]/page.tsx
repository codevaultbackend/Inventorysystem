"use client";

import { useParams, useRouter } from "next/navigation";
import { Boxes, AlertTriangle, Wrench, Package } from "lucide-react";
import StockCategoryBarChart from "../../../Components/StockCategoryBarChart";
import StockCount from "../../../Components/StockCounts";
import StockLineChart from "../../../Components/StockLineChart";
import StockInventoryTable from "../../../Components/StockInventoryTable";

export default function StateDashboardPage() {

  const router = useRouter();
  const params = useParams();

  const stateId = params.stateId as string;

  const formatState = (text: string) => {
    return text.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (

    <div className="w-full min-h-screen bg-[#F6F8FB] p-6">

      {/* Header */}

      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl border flex items-center justify-center bg-white"
        >
          ←
        </button>

        <div>

          <h1 className="text-[22px] font-semibold">
            {formatState(stateId)} Branch
          </h1>

          <p className="text-sm text-gray-400">
            Detailed branch analytics and inventory
          </p>

        </div>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

        <StockCount title="Total Stock Items" value={2543} icon={Boxes} />
        <StockCount title="Purchase Amount" value="$45,892" icon={Package} />
        <StockCount title="Total Stock Value" value="$284,500" icon={Package} />
        <StockCount title="Transit Items" value={158} icon={Package} />

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        <StockLineChart title="Purchase Amount Over Time" data={[]} />
        <StockCategoryBarChart title="Aging Distribution" data={[]} />

      </div>

      {/* Table */}

      <StockInventoryTable
        title="Branch Inventory"
        columns={[
          { key: "item", label: "Item Name" },
          { key: "category", label: "Categories" },
          { key: "current", label: "Current Stock" },
          { key: "stockIn", label: "Stock IN" },
          { key: "stockOut", label: "Stock OUT" },
        ]}
        data={[]}
      />

    </div>
  );
}