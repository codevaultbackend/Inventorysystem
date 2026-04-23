"use client";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FilePlus2,
  FileText,
} from "lucide-react";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import type {
  ClientFormData,
  CreatedClient,
  Product,
} from "./ClientIntakePage";

type Props = {
  clientData: ClientFormData;
  createdClient: CreatedClient | null;
  products: Product[];
  total: number;
  quotationNo: string;
  quotationCreatedAt: string;
  status?: "pending" | "approved" | "rejected";
  onCreateAnotherQuotation: () => void;
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function getStatusClasses(status: "pending" | "approved" | "rejected") {
  if (status === "approved") {
    return "bg-[#DCFCE7] text-[#15803D]";
  }
  if (status === "rejected") {
    return "bg-[#FEE2E2] text-[#DC2626]";
  }
  return "bg-[#FEF3C7] text-[#D97706]";
}

function getStatusLabel(status: "pending" | "approved" | "rejected") {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending Approval";
}

export default function QuotationStep({
  clientData,
  createdClient,
  products,
  total,
  quotationNo,
  quotationCreatedAt,
  status = "pending",
  onCreateAnotherQuotation,
}: Props) {
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${quotationNo || "quotation"}.pdf`);
  };

  return (
    <div className="flex w-full justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="w-full max-w-[980px]">
        <div
          ref={pdfRef}
          className="rounded-[18px] border border-[#DEE4EC] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-5 lg:p-6"
        >
          <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="w-full max-w-[620px]">
              <h1 className="text-[28px] font-[700] leading-[34px] tracking-[-0.02em] text-[#111827]">
                Client Intake
              </h1>

              <p className="mt-[10px] text-[14px] font-[400] leading-[20px] text-[#4B5563]">
                Enter client details to begin the sales process
              </p>

              <div className="mt-[14px] w-full max-w-[520px]">
                <div className="mb-[8px] flex items-center justify-between">
                  <span className="text-[13px] font-[500] leading-[18px] text-[#374151]">
                    Form Completion
                  </span>

                  <span className="text-[13px] font-[700] leading-[18px] text-[#2563EB]">
                    100%
                  </span>
                </div>

                <div className="relative h-[8px] w-full overflow-hidden rounded-full border border-[#E2E8F0] bg-[#E9EDF3]">
                  <div className="h-full w-full rounded-full bg-[#2563EB]" />
                </div>
              </div>
            </div>
          </div>

          {/* STEP INDICATOR */}

          <div className="mb-8 hidden w-full overflow-x-auto pb-1 sm:block">
            <div className="relative min-w-[560px] px-[18px] sm:px-[28px] lg:px-[42px]">
              <div className="absolute left-[74px] right-[74px] top-[15px] h-[8px] rounded-full border border-[#DADADA] bg-[#E7E7E7]" />

              <div className="relative flex items-start justify-between">
                {[1, 2, 3].map((id) => (
                  <div
                    key={id}
                    className="flex min-w-[128px] flex-col items-center"
                  >
                    <div className="relative h-[38px] w-[38px] rounded-full border border-[#D5D5D5] bg-[#F8F8F8]">
                      <div className="absolute inset-[3px] flex items-center justify-center rounded-full border border-[#2563EB] bg-[#2563EB] text-[14px] font-[700] text-white">
                        {id}
                      </div>
                    </div>

                    <div className="mt-[5px] h-0 w-0 border-b-[7px] border-l-[5px] border-r-[5px] border-b-[#D9D9D9] border-l-transparent border-r-transparent" />

                    <div className="mt-[6px] flex h-[32px] items-center justify-center whitespace-nowrap rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-[16px] text-[13px] font-[600] text-[#2563EB]">
                      {id === 1
                        ? "Client-intake"
                        : id === 2
                        ? "Requirements"
                        : "Quotation"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QUOTATION CARD */}

          <div className="rounded-[16px] border border-[#E5E7EB] bg-white">
            <div className="border-b border-[#EEF2F6] bg-[#F9FAFB] px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[18px] font-[700] leading-[24px] text-[#111827] sm:text-[20px]">
                    {quotationNo || "QT000000"}
                  </h2>
                  <p className="text-[13px] text-[#6B7280]">
                    Quotation Details
                  </p>
                </div>

                <div
                  className={`inline-flex h-[36px] w-fit items-center gap-2 rounded-[10px] px-4 text-[14px] font-[500] ${getStatusClasses(
                    status
                  )}`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {getStatusLabel(status)}
                </div>
              </div>
            </div>

            {/* PRODUCTS TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-4 py-4 text-left text-[13px] font-[700]">
                      Product
                    </th>
                    <th className="px-4 py-4 text-left text-[13px] font-[700]">
                      Specifications
                    </th>
                    <th className="px-4 py-4 text-center text-[13px] font-[700]">
                      Quantity
                    </th>
                    <th className="px-4 py-4 text-center text-[13px] font-[700]">
                      Unit Price
                    </th>
                    <th className="px-4 py-4 text-right text-[13px] font-[700]">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const quantity = Number(product.quantity || 0);
                    const price = Number(product.price || 0);
                    const subtotal = quantity * price;

                    return (
                      <tr
                        key={product.id}
                        className="border-t border-[#EEF2F7]"
                      >
                        <td className="px-4 py-4 text-[14px]">
                          {product.name}
                        </td>

                        <td className="px-4 py-4 text-[14px]">
                          {product.specs}
                        </td>

                        <td className="px-4 py-4 text-center text-[14px]">
                          {quantity}
                        </td>

                        <td className="px-4 py-4 text-center text-[14px]">
                          {formatMoney(price)}
                        </td>

                        <td className="px-4 py-4 text-right font-[600]">
                          {formatMoney(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TOTAL */}

            <div className="flex justify-end border-t border-[#EEF2F7] px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="text-[16px] font-[700]">Total:</span>
                <span className="text-[20px] font-[700] text-[#2563EB]">
                  {formatMoney(total)}
                </span>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#EEF2F6] p-4 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onCreateAnotherQuotation}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] bg-white px-5 text-[14px]"
              >
                <FilePlus2 size={16} />
                Create Another Quotation
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-5 text-[14px] text-white"
              >
                <FileText size={16} />
                Download
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[12px] border border-[#B9D3FF] bg-[#EEF5FF] px-4 py-[14px] text-[13px] text-[#1D4ED8]">
            <span className="font-[700]">💡 Tip:</span> This quotation is now
            locked for editing. To make changes, create a new quotation.
          </div>
        </div>
      </div>
    </div>
  );
}