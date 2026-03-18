"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import BranchOverviewPage from "../../../Component/BranchOverviewPage";
import SalesTrendChart from "../../../../reports/components/SalesTrendChart";
import { SalesTrendLine } from "../../../Component/SalesTrendLine";
import { StockTrendBar } from "../../../Component/StockTrendBar";
import AgingAnylysis from '../component/AgingAnalysis'

export default function ItemAnalyzePage() {
    const params = useParams();
    const branchId = params.id;
    const itemId = params.itemId;

    const [active, setActive] = useState("Weekly");

    const itemName = itemId
        ?.toString()
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return (
        <div className="p-6 max-[768px]:bg-transparent
              max-[768px]:border-[0]
              max-[768px]:shadow-[0]  max-[768px]:p-0 bg-[#F7F9FB] min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">{itemId}</h1>
                    <p className="text-gray-500 text-sm">
                        Branch: {branchId}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex gap-2">
                    {["Daily", "Weekly", "Monthly"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setActive(item)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${active === item
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border text-gray-600"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <BranchOverviewPage />


            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 mt-[16px] sm:grid-cols-1 lg:gap-[16px] lg:mt-[16px]">

                <SalesTrendLine />
                <StockTrendBar />
            </div>
             <div className="!mt-[10px]"><BranchOverviewPage /></div>
             <div className="mt-[10px]"><AgingAnylysis /></div>
             


            {/* Aging Table */}


        </div>
    );
}
