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
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatEntryId = (entryId: number) => `LE${String(entryId).padStart(6, "0")}`;

export default function LedgerEntriesTable({
  company,
  onViewInvoice,
  onDownloadInvoice,
  busyAction,
}: Props) {
  const companyLabel =
    company.companyShort || company.companyName || `Client ${company.id}`;

  return (
    <section className="h-[448px] overflow-hidden rounded-[10px] border border-[#CDD6E1] bg-white shadow-none">
      <div className="border-b border-[#D9E1EA] px-[18px] py-[18px] sm:px-[22px] sm:py-[20px]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
            <h2 className="text-[15px] font-semibold leading-none text-[#111827]">
              Company Name :
            </h2>
            <p className="truncate text-[13px] font-medium leading-none text-[#1F2937]">
              {companyLabel}
            </p>
          </div>

          <div className="hidden lg:inline-flex shrink-0 items-center rounded-full bg-[#F3F6FA] px-4 py-2 text-[12px] font-semibold text-[#475467]">
            Total Entries: {company.entries.length}
          </div>
        </div>
      </div>

      <div className="hidden h-[calc(448px-73px)] sm:block">
        <div className="h-full overflow-x-auto">
          <div className="min-w-[1240px]">
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[150px]" />
                  <col className="w-[200px]" />
                  <col className="w-[190px]" />
                  <col className="w-[200px]" />
                  <col className="w-[150px]" />
                  <col className="w-[150px]" />
                  <col className="w-[150px]" />
                  <col className="w-[150px]" />
                </colgroup>

                <thead>
                  <tr className="bg-[#D8E9F8]">
                    <th className="sticky left-0 top-0 z-30 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[22px] text-left text-[12px] font-semibold text-[#1F2937]">
                      Entry ID
                    </th>
                    <th className="sticky top-0 z-20 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[18px] text-left text-[12px] font-semibold text-[#1F2937]">
                      Transactions ID
                    </th>
                    <th className="sticky top-0 z-20 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[18px] text-left text-[12px] font-semibold text-[#1F2937]">
                      Client
                    </th>
                    <th className="sticky top-0 z-20 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[18px] text-left text-[12px] font-semibold text-[#1F2937]">
                      Date &amp; Time
                    </th>
                    <th className="sticky top-0 z-20 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[18px] text-left text-[12px] font-semibold text-[#1F2937]">
                      Received Amt.
                    </th>
                    <th className="sticky top-0 z-20 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[18px] text-left text-[12px] font-semibold text-[#1F2937]">
                      Pending Amt.
                    </th>
                    <th className="sticky top-0 z-20 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[18px] text-left text-[12px] font-semibold text-[#1F2937]">
                      Amount
                    </th>
                    <th className="sticky right-0 top-0 z-30 h-[42px] border-b border-[#C8D8E8] bg-[#D8E9F8] px-[18px] text-center text-[12px] font-semibold text-[#1F2937]">
                      Action
                    </th>
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

                      const rowBg = index % 2 === 0 ? "bg-[#FAFBFC]" : "bg-white";

                      return (
                        <tr
                          key={`${company.id}-${entry.entryId}-${entry.transactionId}`}
                          className={`h-[64px] border-b border-[#EEF2F6] ${rowBg}`}
                        >
                          <td className={`sticky left-0 z-10 ${rowBg} px-[22px] text-[12px] font-semibold text-[#374151]`}>
                            <span className="inline-flex rounded-[8px] bg-[#F3F6FA] px-[10px] py-[8px] leading-none text-[#24476B]">
                              {formatEntryId(entry.entryId)}
                            </span>
                          </td>

                          <td className="px-[18px] text-[12px] font-medium text-[#748092]">
                            <div className="truncate">{entry.transactionId}</div>
                          </td>

                          <td className="px-[18px] text-[12px] font-medium text-[#374151]">
                            <div className="truncate">{entry.client}</div>
                          </td>

                          <td className="px-[18px] text-[12px] font-medium text-[#6B7280]">
                            <div className="truncate">{entry.dateTime}</div>
                          </td>

                          <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                            <div className="whitespace-nowrap">₹{formatMoney(entry.receivedAmount)}</div>
                          </td>

                          <td className="px-[18px] text-[12px] font-semibold text-[#F97316]">
                            <div className="whitespace-nowrap">₹{formatMoney(entry.pendingAmount)}</div>
                          </td>

                          <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                            <div className="whitespace-nowrap">₹{formatMoney(entry.amount)}</div>
                          </td>

                          <td className={`sticky right-0 z-10 ${rowBg} px-[18px] text-center`}>
                            <div className="inline-flex items-center gap-[6px]">
                              <button
                                type="button"
                                onClick={() => onViewInvoice?.(entry)}
                                disabled={!!busyAction}
                                className="inline-flex h-[36px] min-w-[86px] items-center justify-center gap-[5px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[12px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <Eye className="h-[13px] w-[13px]" strokeWidth={1.9} />
                                {isViewing ? "Opening..." : "View"}
                              </button>

                              {onDownloadInvoice ? (
                                <button
                                  type="button"
                                  onClick={() => onDownloadInvoice?.(entry)}
                                  disabled={!!busyAction}
                                  className="inline-flex h-[36px] min-w-[108px] items-center justify-center gap-[5px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[12px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  <Download className="h-[13px] w-[13px]" strokeWidth={1.9} />
                                  {isDownloading ? "Downloading..." : "Download"}
                                </button>
                              ) : null}
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
          </div>
        </div>
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
                      {formatEntryId(entry.entryId)}
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

                    {onDownloadInvoice ? (
                      <button
                        type="button"
                        onClick={() => onDownloadInvoice?.(entry)}
                        disabled={!!busyAction}
                        className="inline-flex h-[30px] items-center gap-1 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-medium text-[#374151] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Download className="h-[12px] w-[12px]" strokeWidth={1.9} />
                        {isDownloading ? "Downloading..." : "Download"}
                      </button>
                    ) : null}
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
                      ₹{formatMoney(entry.receivedAmount)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-[#111827]">Pending:</span>{" "}
                    <span className="font-semibold text-[#F97316]">
                      ₹{formatMoney(entry.pendingAmount)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-[#111827]">Amount:</span>{" "}
                    <span className="font-semibold text-[#16A34A]">
                      ₹{formatMoney(entry.amount)}
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