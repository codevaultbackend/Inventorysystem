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
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function DesktopHeaderCell({
  children,
  className = "",
  stickyLeft = false,
  stickyRight = false,
}: {
  children: React.ReactNode;
  className?: string;
  stickyLeft?: boolean;
  stickyRight?: boolean;
}) {
  return (
    <th
      className={[
        "sticky top-0 z-20 h-[46px] whitespace-nowrap border-b border-[#C6D8EA] bg-[#D8E9F8] px-[18px] text-left text-[11px] font-semibold leading-none text-[#1F2937]",
        stickyLeft ? "left-0 z-30" : "",
        stickyRight ? "right-0 z-30 text-center" : "",
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function DesktopCell({
  children,
  className = "",
  stickyLeft = false,
  stickyRight = false,
  rowBg = "bg-white",
}: {
  children: React.ReactNode;
  className?: string;
  stickyLeft?: boolean;
  stickyRight?: boolean;
  rowBg?: string;
}) {
  return (
    <td
      className={[
        "px-[18px] text-[12px]",
        stickyLeft ? `sticky left-0 z-10 ${rowBg}` : "",
        stickyRight ? `sticky right-0 z-10 ${rowBg}` : "",
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function EmptyStateDesktop() {
  return (
    <tr>
      <td
        colSpan={8}
        className="px-6 py-12 text-center text-[14px] font-medium text-[#6B7280]"
      >
        No ledger entries found.
      </td>
    </tr>
  );
}

export default function LedgerEntriesTable({
  company,
  onViewInvoice,
  onDownloadInvoice,
  busyAction,
}: Props) {
  const companyLabel =
    company.companyShort || company.companyName || `Client ${company.id}`;

  const hasEntries = company.entries.length > 0;

  return (
    <section className="overflow-hidden rounded-[12px] border border-[#CDD6E1] bg-white shadow-none">
      <div className="border-b border-[#D9E1EA] px-[18px] py-[18px] sm:px-[22px] sm:py-[20px]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
            <h2 className="whitespace-nowrap text-[15px] font-semibold leading-none text-[#111827]">
              Company Name :
            </h2>
            <p className="truncate text-[13px] font-medium leading-none text-[#1F2937]">
              {companyLabel}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[12px] text-[#6B7280]">
            <span className="rounded-full bg-[#F3F6FA] px-3 py-1 font-medium text-[#475467]">
              Total Entries: {company.entries.length}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <div className="min-w-[1120px] xl:min-w-[1240px]">
            <div className="max-h-[560px] overflow-y-auto overflow-x-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <DesktopHeaderCell stickyLeft className="min-w-[140px]">
                      Entry ID
                    </DesktopHeaderCell>
                    <DesktopHeaderCell className="min-w-[180px]">
                      Transactions ID
                    </DesktopHeaderCell>
                    <DesktopHeaderCell className="min-w-[180px]">
                      Client
                    </DesktopHeaderCell>
                    <DesktopHeaderCell className="min-w-[180px]">
                      Date &amp; Time
                    </DesktopHeaderCell>
                    <DesktopHeaderCell className="min-w-[150px]">
                      Received Amt.
                    </DesktopHeaderCell>
                    <DesktopHeaderCell className="min-w-[150px]">
                      Pending Amt.
                    </DesktopHeaderCell>
                    <DesktopHeaderCell className="min-w-[140px]">
                      Amount
                    </DesktopHeaderCell>
                    <DesktopHeaderCell stickyRight className="min-w-[170px]">
                      Action
                    </DesktopHeaderCell>
                  </tr>
                </thead>

                <tbody>
                  {hasEntries ? (
                    company.entries.map((entry, index) => {
                      const isViewing =
                        busyAction?.entryId === entry.entryId &&
                        busyAction?.type === "view";

                      const isDownloading =
                        busyAction?.entryId === entry.entryId &&
                        busyAction?.type === "download";

                      const rowBg =
                        index % 2 === 0 ? "bg-[#FAFBFC]" : "bg-white";

                      return (
                        <tr
                          key={`${company.id}-${entry.entryId}-${entry.transactionId}`}
                          className={`${rowBg} border-b border-[#EEF2F6] transition-colors hover:bg-[#F6F9FC]`}
                        >
                          <DesktopCell
                            stickyLeft
                            rowBg={rowBg}
                            className="h-[68px] font-semibold text-[#374151]"
                          >
                            <span className="inline-flex rounded-[6px] bg-[#F3F6FA] px-2 py-1 text-[11px] font-semibold text-[#374151]">
                              LE{String(entry.entryId).padStart(6, "0")}
                            </span>
                          </DesktopCell>

                          <DesktopCell className="font-medium text-[#748092]">
                            <div className="max-w-[160px] truncate xl:max-w-none">
                              {entry.transactionId}
                            </div>
                          </DesktopCell>

                          <DesktopCell className="font-medium text-[#374151]">
                            <div className="max-w-[170px] truncate xl:max-w-none">
                              {entry.client}
                            </div>
                          </DesktopCell>

                          <DesktopCell className="font-medium text-[#6B7280]">
                            <div className="max-w-[170px] truncate xl:max-w-none">
                              {entry.dateTime}
                            </div>
                          </DesktopCell>

                          <DesktopCell className="font-semibold text-[#16A34A]">
                            {formatMoney(entry.receivedAmount)}
                          </DesktopCell>

                          <DesktopCell className="font-semibold text-[#D97706]">
                            {formatMoney(entry.pendingAmount)}
                          </DesktopCell>

                          <DesktopCell className="font-semibold text-[#16A34A]">
                            {formatMoney(entry.amount)}
                          </DesktopCell>

                          <DesktopCell
                            stickyRight
                            rowBg={rowBg}
                            className="text-center"
                          >
                            <div className="flex items-center justify-center gap-[8px]">
                              <button
                                type="button"
                                onClick={() => onViewInvoice?.(entry)}
                                disabled={!!busyAction}
                                className="inline-flex h-[30px] min-w-[84px] items-center justify-center gap-[6px] rounded-[6px] border border-[#E5E7EB] bg-white px-[12px] text-[11px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <Eye
                                  className="h-[13px] w-[13px]"
                                  strokeWidth={1.9}
                                />
                                {isViewing ? "Opening..." : "View"}
                              </button>

                              <button
                                type="button"
                                onClick={() => onDownloadInvoice?.(entry)}
                                disabled={!!busyAction}
                                className="inline-flex h-[30px] min-w-[108px] items-center justify-center gap-[6px] rounded-[6px] border border-[#E5E7EB] bg-white px-[12px] text-[11px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <Download
                                  className="h-[13px] w-[13px]"
                                  strokeWidth={1.9}
                                />
                                {isDownloading ? "Downloading..." : "Download"}
                              </button>
                            </div>
                          </DesktopCell>
                        </tr>
                      );
                    })
                  ) : (
                    <EmptyStateDesktop />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:hidden">
        {hasEntries ? (
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