"use client";

import { Eye } from "lucide-react";
import { Quotation } from "../page";

interface Props {
  data: Quotation;
  onView: () => void;
}

function formatCurrency(value: number) {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusStyle(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "approved") {
    return "bg-[#DCFCE7] text-[#15803D]";
  }

  if (normalized === "rejected") {
    return "bg-[#FEE2E2] text-[#B91C1C]";
  }

  if (normalized === "invoiced") {
    return "bg-[#E0E7FF] text-[#4338CA]";
  }

  return "bg-[#FEF3C7] text-[#B45309]";
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default function QuotationCard({ data, onView }: Props) {
  const clientName =
    data.client?.name || data.client?.email || data.client?.phone || "Walk-in Client";

  return (
    <div className="rounded-[14px] border border-[#EEF2F7] bg-white p-4 transition hover:shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-semibold text-[#111827] sm:text-[15px]">
              {data.quotation_no}
            </p>

            <span
              className={`rounded-full px-2.5 py-[4px] text-[11px] font-medium ${getStatusStyle(
                data.status
              )}`}
            >
              {formatStatus(data.status)}
            </span>
          </div>

          <p className="mt-2 truncate text-[13px] text-[#6B7280]">
            {clientName}
          </p>

          <p className="mt-1 text-[12px] text-[#9CA3AF]">
            Created: {formatDate(data.createdAt)}
          </p>

          <p className="mt-1 text-[12px] text-[#9CA3AF]">
            Branch: {data.branch?.name || "-"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
          <div className="min-w-[120px]">
            <p className="text-[11px] text-[#9CA3AF]">Total Amount</p>
            <p className="text-[16px] font-semibold text-[#111827]">
              {formatCurrency(data.total_amount)}
            </p>
          </div>

          <button
            onClick={onView}
            className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[8px] bg-[#2563EB] px-4 text-[12px] font-medium text-white transition hover:bg-[#1D4ED8]"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      </div>
    </div>
  );
}