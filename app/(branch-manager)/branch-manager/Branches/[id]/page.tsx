"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

import BranchOverviewCounts from "../Component/BranchOverviewPage";
import { StockTrendBar } from "../Component/StockTrendBar";
import { SalesTrendLine } from "../Component/SalesTrendLine";
import InventoryItems from "../Component/InventoryItems";

export default function BranchDetailsPage() {

  const params = useParams<{ id?: string }>();
  const { user } = useAuth();

  const branchId =
    user?.role === "super_admin"
      ? params?.id
      : user?.branch_id?.toString();

  /* ================= NOT FOUND ================= */

  if (!branchId) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="bg-white border border-[#EEF2F6] rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Branch not found
          </h2>

          <p className="text-sm text-[#64748B] mt-2">
            The branch you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}

      <div
        className="bg-white border border-[#EEF2F6]
        max-[768px]:bg-transparent
        max-[768px]:border-0
        max-[768px]:shadow-none
        max-[768px]:p-0
        rounded-2xl shadow-sm p-6"
      >

        <h1 className="text-[24px] md:text-[28px] font-semibold text-[#0F172A]">
          Branch {branchId}
        </h1>

        <p className="text-[13px] text-[#64748B] mt-1">
          Detailed branch analytics and inventory overview
        </p>

      </div>

      {/* ================= STATS ================= */}

      <div
        className="bg-white border border-[#EEF2F6]
        max-[768px]:bg-transparent
        max-[768px]:border-0
        max-[768px]:shadow-none
        max-[768px]:p-0
        rounded-2xl shadow-sm p-6"
      >
        <BranchOverviewCounts branchId={branchId} />
      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <div
          className="bg-white border border-[#EEF2F6]
          max-[768px]:bg-transparent
          max-[768px]:border-0
          max-[768px]:shadow-none
          max-[768px]:p-0
          rounded-2xl shadow-sm p-6"
        >
          <StockTrendBar branchId={branchId} />
        </div>

        <div
          className="bg-white border border-[#EEF2F6]
          max-[768px]:bg-transparent
          max-[768px]:border-0
          max-[768px]:shadow-none
          max-[768px]:p-0
          rounded-2xl shadow-sm p-6"
        >
          <SalesTrendLine branchId={branchId} />
        </div>

      </div>

      {/* ================= INVENTORY ================= */}

      <div
        className="bg-white border border-[#EEF2F6]
        max-[768px]:bg-transparent
        max-[768px]:border-0
        max-[768px]:shadow-none
        max-[768px]:p-0
        rounded-2xl shadow-sm p-6"
      >

        <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">
          Inventory Items
        </h3>

        <InventoryItems branchId={branchId} />

      </div>

    </div>
  );
}