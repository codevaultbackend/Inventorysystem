"use client";

import { CalendarDays, FileText, X } from "lucide-react";
import ApprovedAlert from "./ApprovedAlert";

type QuotationItem = {
  id?: number | string;
  product_name?: string;
  productName?: string;
  specifications?: string;
  specification?: string;
  quantity?: number | string;
  unit_price?: number | string;
  unitPrice?: number | string;
  amount?: number | string;
  subtotal?: number | string;
};

type QuotationClient = {
  id?: number | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type QuotationBranch = {
  id?: number | string;
  name?: string;
  location?: string;
};

type Quotation = {
  id: number;
  quotation_no?: string;
  total_amount?: number | string;
  gst_amount?: number | string;
  valid_till?: string | null;
  createdAt?: string;
  status?: string;
  client?: QuotationClient | null;
  branch?: QuotationBranch | null;
  items?: QuotationItem[];
};

interface Props {
  quote: Quotation;
  onClose: () => void;
  onApprove?: (quoteId: number) => Promise<void>;
  approveLoading?: boolean;
  canApprove?: boolean;
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,₹\s]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatCurrency(value: unknown) {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value))}`;
}

function formatDate(date?: string | null) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatStatus(status?: string) {
  const normalized = (status || "pending").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getStatusClasses(status?: string) {
  const normalized = (status || "pending").toLowerCase();

  if (normalized === "approved") {
    return "bg-[#DCFCE7] text-[#16A34A]";
  }

  if (normalized === "rejected") {
    return "bg-[#FEE2E2] text-[#DC2626]";
  }

  return "bg-[#FEF3C7] text-[#D97706]";
}

export default function QuotationModal({
  quote,
  onClose,
  onApprove,
  approveLoading = false,
  canApprove = false,
}: Props) {
  const status = (quote.status || "pending").toLowerCase();
  const quotationNo = quote.quotation_no || `QT${quote.id}`;
  const clientName =
    quote.client?.name || quote.client?.email || quote.client?.phone || "athratech";
  const clientId = quote.client?.id ? `CL${quote.client.id}` : "CL454632";
  const items = quote.items || [];
  const totalAmount = toNumber(quote.total_amount);
  const isApproved = status === "approved";
  const showApproveButton = status === "pending" && canApprove && onApprove;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-3 sm:p-4 md:p-6">
      <div className="relative w-full max-w-[1000px] rounded-[20px] bg-[#F4F7FB] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] sm:right-5 sm:top-5"
        >
          <X size={18} />
        </button>

        <div className="max-h-[90vh] overflow-y-auto px-4 py-5 sm:px-8 sm:py-7 md:px-10 md:py-8 lg:px-[56px] lg:py-[36px]">
          <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-start sm:justify-between">
            <div className="pr-10">
              <h2 className="text-[28px] font-[700] leading-none tracking-[-0.02em] text-[#111827] sm:text-[32px]">
                {quotationNo}
              </h2>
              <p className="mt-2 text-[16px] font-[400] text-[#6B7280]">
                Quotation Details
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {showApproveButton && (
                <button
                  onClick={() => onApprove(quote.id)}
                  disabled={approveLoading}
                  className="rounded-[10px] bg-[#16A34A] px-4 py-2 text-[14px] font-[600] text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {approveLoading ? "Approving..." : "Approve"}
                </button>
              )}

              <span
                className={`inline-flex items-center rounded-[10px] px-[14px] py-[9px] text-[15px] font-[500] ${getStatusClasses(
                  status
                )}`}
              >
                <span className="mr-2 text-[14px]">◌</span>
                {formatStatus(status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[14px] border border-[#D9DEE7] bg-white p-5 shadow-[0_2px_10px_rgba(17,24,39,0.03)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center text-[#2563EB]">
                  <FileText size={20} strokeWidth={1.9} />
                </div>
                <h3 className="text-[18px] font-[700] text-[#111827]">
                  Client Information
                </h3>
              </div>

              <div className="space-y-1">
                <p className="break-words text-[17px] font-[500] text-[#111827]">
                  {clientName}
                </p>
                <p className="text-[15px] text-[#6B7280]">
                  Client ID: {clientId}
                </p>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#D9DEE7] bg-white p-5 shadow-[0_2px_10px_rgba(17,24,39,0.03)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center text-[#2563EB]">
                  <CalendarDays size={20} strokeWidth={1.9} />
                </div>
                <h3 className="text-[18px] font-[700] text-[#111827]">
                  Quote Details
                </h3>
              </div>

              <div className="space-y-1">
                <p className="text-[15px] text-[#4B5563]">
                  Created: {formatDate(quote.createdAt)}
                </p>
                <p className="text-[15px] text-[#4B5563]">
                  Status: {status}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[14px] border border-[#D9DEE7] bg-white shadow-[0_2px_10px_rgba(17,24,39,0.03)]">
            <div className="border-b border-[#E5E7EB] px-5 py-5">
              <h3 className="text-[18px] font-[700] text-[#111827]">Products</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#FCFCFD]">
                    <th className="px-5 py-4 text-left text-[14px] font-[700] text-[#111827]">
                      Product
                    </th>
                    <th className="px-5 py-4 text-left text-[14px] font-[700] text-[#111827]">
                      Specifications
                    </th>
                    <th className="px-5 py-4 text-center text-[14px] font-[700] text-[#111827]">
                      Quantity
                    </th>
                    <th className="px-5 py-4 text-center text-[14px] font-[700] text-[#111827]">
                      Unit Price
                    </th>
                    <th className="px-5 py-4 text-right text-[14px] font-[700] text-[#111827]">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => {
                      const productName =
                        item.product_name || item.productName || "pump";
                      const specifications =
                        item.specifications || item.specification || "dfghjklrtyuio";
                      const quantity = item.quantity ?? 1;
                      const unitPrice = item.unit_price ?? item.unitPrice ?? 2000;
                      const subtotal = item.amount ?? item.subtotal ?? 2000;

                      return (
                        <tr
                          key={item.id ?? index}
                          className="border-b border-[#E5E7EB] last:border-b-0"
                        >
                          <td className="px-5 py-5 text-[15px] font-[500] text-[#374151]">
                            {productName}
                          </td>
                          <td className="px-5 py-5 text-[15px] text-[#6B7280]">
                            {specifications}
                          </td>
                          <td className="px-5 py-5 text-center text-[15px] text-[#374151]">
                            {quantity}
                          </td>
                          <td className="px-5 py-5 text-center text-[15px] text-[#374151]">
                            {formatCurrency(unitPrice)}
                          </td>
                          <td className="px-5 py-5 text-right text-[15px] font-[600] text-[#374151]">
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-[15px] text-[#6B7280]"
                      >
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-[#E5E7EB] bg-[#FCFCFD] px-5 py-5">
              <div className="flex items-center gap-3">
                <span className="text-[30px] leading-none text-[#374151]">$</span>
                <span className="text-[16px] font-[700] text-[#111827]">
                  Total:
                </span>
                <span className="text-[18px] font-[800] text-[#2563EB] sm:text-[20px]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {isApproved && (
            <div className="mt-5">
              <ApprovedAlert />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}