"use client";

import { X } from "lucide-react";
import { Quotation } from "../page";
import ApprovedAlert from "./ApprovedAlert";

interface Props {
  quote: Quotation;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)}`;
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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

export default function QuotationModal({ quote, onClose }: Props) {
  const clientName =
    quote.client?.name || quote.client?.email || quote.client?.phone || "Walk-in Client";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4">
      <div className="flex min-h-full items-center justify-center">
        <div className="max-h-[92vh] w-full max-w-[980px] overflow-y-auto rounded-[20px] bg-white p-4 shadow-xl sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#EEF2F6] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-[#111827]">
                {quote.quotation_no}
              </h1>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Quotation Details
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-[6px] text-[12px] font-medium ${getStatusStyle(
                  quote.status
                )}`}
              >
                {formatStatus(quote.status)}
              </span>

              <button
                onClick={onClose}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {quote.status === "approved" && <ApprovedAlert />}

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[14px] border border-[#EEF2F7] p-4">
              <p className="mb-3 text-[14px] font-semibold text-[#111827]">
                Client Information
              </p>

              <div className="space-y-2 text-[13px] text-[#374151]">
                <p>
                  <span className="font-medium text-[#111827]">Name:</span>{" "}
                  {clientName}
                </p>
                <p>
                  <span className="font-medium text-[#111827]">Client ID:</span>{" "}
                  {quote.client?.id || "-"}
                </p>
                <p>
                  <span className="font-medium text-[#111827]">Phone:</span>{" "}
                  {quote.client?.phone || "-"}
                </p>
                <p>
                  <span className="font-medium text-[#111827]">Email:</span>{" "}
                  {quote.client?.email || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#EEF2F7] p-4">
              <p className="mb-3 text-[14px] font-semibold text-[#111827]">
                Quote Details
              </p>

              <div className="space-y-2 text-[13px] text-[#374151]">
                <p>
                  <span className="font-medium text-[#111827]">Branch:</span>{" "}
                  {quote.branch?.name || "-"}
                </p>
                <p>
                  <span className="font-medium text-[#111827]">Location:</span>{" "}
                  {quote.branch?.location || "-"}
                </p>
                <p>
                  <span className="font-medium text-[#111827]">Created:</span>{" "}
                  {formatDate(quote.createdAt)}
                </p>
                <p>
                  <span className="font-medium text-[#111827]">Valid Till:</span>{" "}
                  {formatDate(quote.valid_till)}
                </p>
                <p>
                  <span className="font-medium text-[#111827]">Status:</span>{" "}
                  {formatStatus(quote.status)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-[#EEF2F7]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-[13px]">
                <thead className="border-b border-[#EEF2F7] bg-[#F8FAFC] text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Product</th>
                    <th className="px-4 py-3 text-left font-medium">Quantity</th>
                    <th className="px-4 py-3 text-left font-medium">Unit Price</th>
                    <th className="px-4 py-3 text-left font-medium">CGST</th>
                    <th className="px-4 py-3 text-left font-medium">SGST</th>
                    <th className="px-4 py-3 text-left font-medium">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {quote.items.map((item) => (
                    <tr key={item.id} className="border-b border-[#F1F5F9] last:border-b-0">
                      <td className="px-4 py-3 text-[#111827]">{item.product_name}</td>
                      <td className="px-4 py-3 text-[#374151]">{item.quantity}</td>
                      <td className="px-4 py-3 text-[#374151]">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-[#374151]">{item.cgst}%</td>
                      <td className="px-4 py-3 text-[#374151]">{item.sgst}%</td>
                      <td className="px-4 py-3 font-medium text-[#111827]">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#EEF2F7] bg-[#FCFDFE] p-4">
              <div className="ml-auto max-w-[280px] space-y-2 text-[13px]">
                <div className="flex items-center justify-between text-[#374151]">
                  <span>GST Amount</span>
                  <span>{formatCurrency(quote.gst_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-[16px] font-semibold text-[#111827]">
                  <span>Total</span>
                  <span>{formatCurrency(quote.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-[10px] bg-[#111827] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#1F2937]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}