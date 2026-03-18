"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Download, FileText, Loader2, Printer } from "lucide-react";
import type { LedgerCompany, LedgerEntry } from "../data/ledgerData";

type Props = {
  company: LedgerCompany;
  entry: LedgerEntry;
};

const ATHRATECH_QR_URL = "https://www.athratech.com/";

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-[#7A8699]">{label}</p>
      <p className="mt-1 break-words text-[14px] font-semibold leading-[20px] text-[#1F2A44]">
        {value}
      </p>
    </div>
  );
}

function PartyCard({
  title,
  company,
  address,
  gst,
  location,
}: {
  title: string;
  company: string;
  address: string;
  gst: string;
  location: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#D9E2EC] bg-[#F8FBFF] px-4 py-4 sm:px-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.03em] text-[#75839A]">
        {title}
      </p>

      <h3 className="mt-3 text-[16px] font-semibold leading-[22px] text-[#1F2A44] sm:text-[18px]">
        {company}
      </h3>

      <p className="mt-2 text-[13px] leading-[20px] text-[#526177] sm:text-[14px]">
        {address}
      </p>

      <p className="text-[13px] leading-[20px] text-[#526177] sm:text-[14px]">
        GSTNUM: {gst}
      </p>

      <p className="text-[13px] leading-[20px] text-[#526177] sm:text-[14px]">
        {location}
      </p>
    </div>
  );
}

export default function LedgerInvoiceView({ company, entry }: Props) {
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(ATHRATECH_QR_URL, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch(() => setQrCodeUrl(""));
  }, []);

  const computed = useMemo(() => {
    const subTotal = entry.items.reduce((sum, item) => sum + item.amount, 0);
    const cgstTotal = entry.taxes.reduce(
      (sum, row) => sum + row.centralTaxAmount,
      0
    );
    const sgstTotal = entry.taxes.reduce(
      (sum, row) => sum + row.stateTaxAmount,
      0
    );
    const totalTax = entry.taxes.reduce((sum, row) => sum + row.totalTax, 0);
    const grandTotal = subTotal + totalTax;

    return {
      subTotal,
      cgstTotal,
      sgstTotal,
      totalTax,
      grandTotal,
    };
  }, [entry]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
  if (!invoiceRef.current) return;

  try {
    setIsDownloading(true);

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imageData, "PNG", margin, position, usableWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(
        imageData,
        "PNG",
        margin,
        position,
        usableWidth,
        imgHeight
      );
      heightLeft -= usableHeight;
    }

    const fileName = `${company?.id ?? "company"}-${entry?.id ?? "invoice"}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("PDF generation failed:", error);
  } finally {
    setIsDownloading(false);
  }
};

  return (
    <>
      <div className="min-h-screen bg-[#F7F9FC] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 print:bg-white print:p-0">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-4 flex flex-col items-stretch justify-end gap-3 sm:flex-row print:hidden">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#D8E0EA] bg-white px-4 py-2.5 text-[13px] font-medium text-[#1F2A44] shadow-sm transition hover:bg-[#F8FBFF] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? "Generating PDF..." : "Download"}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#D8E0EA] bg-white px-4 py-2.5 text-[13px] font-medium text-[#1F2A44] shadow-sm transition hover:bg-[#F8FBFF]"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>

          <div className="rounded-[26px] border border-[#E5EBF2] bg-[#F1F5F9] p-3 shadow-[0_25px_60px_rgba(15,23,42,0.08)] sm:p-5 lg:p-8 print:border-0 print:bg-white print:p-0 print:shadow-none">
            <div
              ref={invoiceRef}
              className="mx-auto w-full max-w-[920px] rounded-[22px] border border-[#E7EDF4] bg-white px-4 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.14)] sm:px-7 sm:py-7 lg:px-9 lg:py-8 print:max-w-none print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D8E0EA] bg-white text-[#1F2A44]">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div>
                        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#1F2A44] sm:text-[36px]">
                          Tax Invoice
                        </h1>

                        <span className="mt-2 inline-flex rounded-full border border-[#C9D8FF] bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#4E74D9]">
                          e-Invoice
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="flex h-[104px] w-[104px] items-center justify-center rounded-[10px] border border-[#D8E0EA] bg-white sm:h-[126px] sm:w-[126px]">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="Athratech QR"
                          className="h-full w-full rounded-[8px] object-contain p-1"
                        />
                      ) : (
                        <div className="h-12 w-12 animate-pulse rounded bg-[#E2E8F0]" />
                      )}
                    </div>

                    <div className="text-left text-[11px] leading-[17px] text-[#6B7A90] sm:max-w-[300px] sm:text-right">
                      <p className="break-all">
                        IRN: {entry.irn}
                      </p>
                      <p>Ack No: {entry.ackNo}</p>
                      <p>Ack Date: {entry.ackDate}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-[#E8EDF3]" />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <PartyCard
                    title="Seller Details"
                    company={entry.seller.company}
                    address={entry.seller.address}
                    gst={entry.seller.gst}
                    location={entry.seller.location}
                  />

                  <PartyCard
                    title="Buyer Details"
                    company={entry.buyer.company}
                    address={entry.buyer.address}
                    gst={entry.buyer.gst}
                    location={entry.buyer.location}
                  />
                </div>

                <div className="rounded-[12px] border border-[#D9E2EC] bg-[#F8FBFF] p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoField label="Bill Number" value={entry.billNumber} />
                    <InfoField label="Delivery Date" value={entry.deliveryDate} />
                    <InfoField label="Invoice Date" value={entry.invoiceDate} />
                    <InfoField
                      label="Mode of Payment"
                      value={entry.modeOfPayment}
                    />

                    <InfoField label="Reference No." value={entry.referenceNo} />
                    <InfoField
                      label="Other References"
                      value={entry.otherReferences}
                    />
                    <InfoField
                      label="Buyer's Order No."
                      value={entry.buyersOrderNo}
                    />
                    <InfoField
                      label="Dispatch Doc No."
                      value={entry.dispatchDocNo}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-[12px] border border-[#D9E2EC]">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="bg-[#1F2A44] text-white">
                        <th className="px-4 py-3 text-left text-[12px] font-semibold">
                          Sl
                        </th>
                        <th className="px-4 py-3 text-left text-[12px] font-semibold">
                          Description of Goods
                        </th>
                        <th className="px-4 py-3 text-left text-[12px] font-semibold">
                          HSN/SAC
                        </th>
                        <th className="px-4 py-3 text-left text-[12px] font-semibold">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-[12px] font-semibold">
                          Rate
                        </th>
                        <th className="px-4 py-3 text-left text-[12px] font-semibold">
                          Disc %
                        </th>
                        <th className="px-4 py-3 text-right text-[12px] font-semibold">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {entry.items.map((item, index) => (
                        <tr key={item.id} className="border-b border-[#E8EDF3]">
                          <td className="px-4 py-3 text-[13px] text-[#1F2A44]">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-[13px] font-medium text-[#1F2A44]">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#334155]">
                            {item.hsnSac}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#334155]">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#334155]">
                            {formatAmount(item.rate)}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#334155]">
                            {item.disc}
                          </td>
                          <td className="px-4 py-3 text-right text-[13px] font-semibold text-[#1F2A44]">
                            {formatAmount(item.amount)}
                          </td>
                        </tr>
                      ))}

                      <tr className="border-b border-[#E8EDF3]">
                        <td colSpan={5} className="px-4 py-3" />
                        <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">
                          CGST
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold text-[#1F2A44]">
                          {formatAmount(computed.cgstTotal)}
                        </td>
                      </tr>

                      <tr className="border-b border-[#E8EDF3]">
                        <td colSpan={5} className="px-4 py-3" />
                        <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">
                          SGST
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold text-[#1F2A44]">
                          {formatAmount(computed.sgstTotal)}
                        </td>
                      </tr>

                      <tr className="bg-[#1F2A44] text-white">
                        <td colSpan={5} className="px-4 py-4" />
                        <td className="px-4 py-4 text-[14px] font-semibold">
                          Total
                        </td>
                        <td className="px-4 py-4 text-right text-[16px] font-bold">
                          ₹ {formatAmount(computed.grandTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-[12px] border border-[#D9E2EC] bg-[#F8FBFF] p-4 sm:p-5">
                  <h2 className="text-[16px] font-semibold text-[#1F2A44] sm:text-[18px]">
                    Tax Breakdown
                  </h2>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse">
                      <thead>
                        <tr className="border-b border-[#D9E2EC]">
                          <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#1F2A44]">
                            HSN/SAC
                          </th>
                          <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#1F2A44]">
                            Taxable Value
                          </th>
                          <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#1F2A44]">
                            Central Tax Rate
                          </th>
                          <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#1F2A44]">
                            Central Tax Amount
                          </th>
                          <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#1F2A44]">
                            State Tax Rate
                          </th>
                          <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#1F2A44]">
                            State Tax Amount
                          </th>
                          <th className="px-3 py-3 text-right text-[12px] font-semibold text-[#1F2A44]">
                            Total Tax
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {entry.taxes.map((tax, index) => (
                          <tr
                            key={`${tax.hsnSac}-${index}`}
                            className="border-b border-[#E8EDF3]"
                          >
                            <td className="px-3 py-3 text-[13px] text-[#334155]">
                              {tax.hsnSac}
                            </td>
                            <td className="px-3 py-3 text-[13px] text-[#334155]">
                              {formatAmount(tax.taxableValue)}
                            </td>
                            <td className="px-3 py-3 text-[13px] text-[#334155]">
                              {tax.centralTaxRate}
                            </td>
                            <td className="px-3 py-3 text-[13px] text-[#334155]">
                              {formatAmount(tax.centralTaxAmount)}
                            </td>
                            <td className="px-3 py-3 text-[13px] text-[#334155]">
                              {tax.stateTaxRate}
                            </td>
                            <td className="px-3 py-3 text-[13px] text-[#334155]">
                              {formatAmount(tax.stateTaxAmount)}
                            </td>
                            <td className="px-3 py-3 text-right text-[13px] font-semibold text-[#1F2A44]">
                              {formatAmount(tax.totalTax)}
                            </td>
                          </tr>
                        ))}

                        <tr>
                          <td className="px-3 py-3 text-[13px] font-bold text-[#1F2A44]">
                            Total
                          </td>
                          <td className="px-3 py-3 text-[13px] font-bold text-[#1F2A44]">
                            {formatAmount(computed.subTotal)}
                          </td>
                          <td className="px-3 py-3" />
                          <td className="px-3 py-3 text-[13px] font-bold text-[#1F2A44]">
                            {formatAmount(computed.cgstTotal)}
                          </td>
                          <td className="px-3 py-3" />
                          <td className="px-3 py-3 text-[13px] font-bold text-[#1F2A44]">
                            {formatAmount(computed.sgstTotal)}
                          </td>
                          <td className="px-3 py-3 text-right text-[13px] font-bold text-[#1F2A44]">
                            {formatAmount(computed.totalTax)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#D9E2EC] bg-[#F8FBFF] px-4 py-4 sm:px-5">
                  <p className="text-[12px] text-[#7A8699]">Tax Amount (in words)</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#1F2A44] sm:text-[16px]">
                    {entry.taxAmountWords}
                  </p>
                </div>

                <div className="pt-1">
                  <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-[420px]">
                      <p className="text-[12px] font-semibold text-[#6B7A90]">
                        Terms of Delivery:
                      </p>
                      <p className="mt-1 text-[12px] italic text-[#6B7A90] sm:text-[13px]">
                        {entry.terms}
                      </p>
                    </div>

                    <div className="w-full max-w-[220px] text-left sm:text-right">
                      <p className="text-[13px] font-semibold text-[#1F2A44]">
                        Authorised Signatory
                      </p>
                      <div className="mt-10 h-px w-full bg-[#CBD5E1]" />
                    </div>
                  </div>

                  <div className="mt-4 h-px w-full bg-[#E8EDF3]" />

                  <p className="pt-4 text-center text-[11px] italic text-[#90A0B7] sm:text-[12px]">
                    This is a Computer Generated Invoice
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          html,
          body {
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}