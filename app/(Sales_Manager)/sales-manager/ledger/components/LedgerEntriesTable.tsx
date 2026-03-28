"use client";

import { Download, Eye } from "lucide-react";

type LedgerEntry = {
  entryId: number;
  transactionId: string;
  client: string;
  dateTime: string;
  amount: number;
  receivedAmount: number;
  pendingAmount: number;
  quotationId?: number | null;
  quotation_id?: number | null;
  invoiceId?: number | null;
  invoice_id?: number | null;
};

type LedgerCompany = {
  id: number;
  companyName?: string;
  companyShort?: string;
  entries: LedgerEntry[];
};

type Props = {
  company: LedgerCompany;
  onViewInvoice?: (entry: LedgerEntry) => void;
  onDownloadInvoice?: (entry: LedgerEntry) => void;
  busyAction?: {
    entryId: number;
    type: "view" | "download";
  } | null;
};

const formatMoney = (value: number) =>
  `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}`;

export default function LedgerEntriesTable({
  company,
  onViewInvoice,
  onDownloadInvoice,
  busyAction,
}: Props) {
  const companyLabel =
    company.companyShort || company.companyName || `Client ${company.id}`;

  return (
    <section className="overflow-hidden rounded-[10px] border border-[#CDD6E1] bg-white shadow-none">
      <div className="border-b border-[#D9E1EA] px-[18px] py-[18px] sm:px-[22px] sm:py-[20px]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
          <h2 className="text-[15px] font-semibold leading-none text-[#111827]">
            Company Name :
          </h2>
          <p className="text-[13px] font-medium leading-none text-[#1F2937]">
            {companyLabel}
          </p>
        </div>
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[1160px] border-collapse">
          <thead>
            <tr className="h-[42px] bg-[#D8E9F8]">
              {[
                "Entry ID",
                "Transactions ID",
                "Client",
                "Date & Time",
                "Received Amt.",
                "Pending Amt.",
                "Amount",
                "Action",
              ].map((head, index) => (
                <th
                  key={`${head}-${index}`}
                  className={[
                    "whitespace-nowrap px-[18px] text-left text-[11px] font-semibold leading-none text-[#1F2937]",
                    index === 7 ? "text-center" : "",
                  ].join(" ")}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {company.entries.length > 0 ? (
              company.entries.map((entry, index) => {
                const isViewing =
                  busyAction?.entryId === entry.entryId &&
                  busyAction?.type === "view";

                const isDownloading =
                  busyAction?.entryId === entry.entryId &&
                  busyAction?.type === "download";

                return (
                  <tr
                    key={`${company.id}-${entry.entryId}-${entry.transactionId}`}
                    className={`h-[64px] border-b border-[#EEF2F6] ${
                      index % 2 === 0 ? "bg-[#FAFBFC]" : "bg-white"
                    }`}
                  >
                    <td className="px-[18px] text-[12px] font-semibold text-[#374151]">
                      LE{String(entry.entryId).padStart(6, "0")}
                    </td>

                    <td className="px-[18px] text-[12px] font-medium text-[#748092]">
                      {entry.transactionId}
                    </td>

                    <td className="px-[18px] text-[12px] font-medium text-[#374151]">
                      {entry.client}
                    </td>

                    <td className="px-[18px] text-[12px] font-medium text-[#6B7280]">
                      {entry.dateTime}
                    </td>

                    <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                      {formatMoney(entry.receivedAmount)}
                    </td>

                    <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                      {formatMoney(entry.pendingAmount)}
                    </td>

                    <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                      {formatMoney(entry.amount)}
                    </td>

                    <td className="px-[18px] text-center">
                      <div className="inline-flex items-center gap-[6px]">
                        <button
                          type="button"
                          onClick={() => onViewInvoice?.(entry)}
                          disabled={!!busyAction}
                          className="inline-flex h-[28px] items-center gap-[5px] rounded-[5px] border border-[#E5E7EB] bg-white px-[11px] text-[11px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Eye className="h-[12px] w-[12px]" strokeWidth={1.9} />
                          {isViewing ? "Opening..." : "View"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDownloadInvoice?.(entry)}
                          disabled={!!busyAction}
                          className="inline-flex h-[28px] items-center gap-[5px] rounded-[5px] border border-[#E5E7EB] bg-white px-[11px] text-[11px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Download
                            className="h-[12px] w-[12px]"
                            strokeWidth={1.9}
                          />
                          {isDownloading ? "Downloading..." : "Download"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-[14px] text-[#6B7280]"
                >
                  No ledger entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:hidden">
        {company.entries.length > 0 ? (
          company.entries.map((entry) => {
            const isViewing =
              busyAction?.entryId === entry.entryId &&
              busyAction?.type === "view";

            const isDownloading =
              busyAction?.entryId === entry.entryId &&
              busyAction?.type === "download";

            return (
              <div
                key={`${company.id}-${entry.entryId}-${entry.transactionId}-mobile`}
                className="rounded-[12px] border border-[#E5E7EB] bg-[#FCFCFD] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#111827]">
                      LE{String(entry.entryId).padStart(6, "0")}
                    </p>
                    <p className="mt-1 truncate text-[12px] text-[#6B7280]">
                      {entry.transactionId}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewInvoice?.(entry)}
                      disabled={!!busyAction}
                      className="inline-flex h-[30px] items-center gap-1 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-medium text-[#374151] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Eye className="h-[12px] w-[12px]" strokeWidth={1.9} />
                      {isViewing ? "Opening..." : "View"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDownloadInvoice?.(entry)}
                      disabled={!!busyAction}
                      className="inline-flex h-[30px] items-center gap-1 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-medium text-[#374151] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Download
                        className="h-[12px] w-[12px]"
                        strokeWidth={1.9}
                      />
                      {isDownloading ? "Downloading..." : "Download"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-[12px] text-[#4B5563]">
                  <p>
                    <span className="font-medium text-[#111827]">Client:</span>{" "}
                    {entry.client}
                  </p>
                  <p>
                    <span className="font-medium text-[#111827]">Date:</span>{" "}
                    {entry.dateTime}
                  </p>
                  <p>
                    <span className="font-medium text-[#111827]">Received:</span>{" "}
                    <span className="font-semibold text-[#16A34A]">
                      {formatMoney(entry.receivedAmount)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-[#111827]">Pending:</span>{" "}
                    <span className="font-semibold text-[#D97706]">
                      {formatMoney(entry.pendingAmount)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-[#111827]">Amount:</span>{" "}
                    <span className="font-semibold text-[#16A34A]">
                      {formatMoney(entry.amount)}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[12px] border border-dashed border-[#D7DEE7] bg-[#FAFBFC] px-4 py-8 text-center text-[14px] text-[#6B7280]">
            No ledger entries found.
          </div>
        )}
      </div>
    </section>
  );
}