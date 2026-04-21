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
        "sticky top-0 z-20 h-[48px] whitespace-nowrap border-b border-[#C6D8EA] bg-[#D8E9F8] px-4 text-left text-[11px] font-semibold leading-none text-[#1F2937] sm:px-[18px]",
        stickyLeft ? "left-0 z-30 shadow-[1px_0_0_0_#C6D8EA]" : "",
        stickyRight ? "right-0 z-30 text-center shadow-[-1px_0_0_0_#C6D8EA]" : "",
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
        "px-4 text-[12px] sm:px-[18px]",
        stickyLeft ? `sticky left-0 z-10 ${rowBg} shadow-[1px_0_0_0_#EEF2F6]` : "",
        stickyRight ? `sticky right-0 z-10 ${rowBg} shadow-[-1px_0_0_0_#EEF2F6]` : "",
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
        className="px-6 py-14 text-center text-[14px] font-medium text-[#6B7280]"
      >
        No ledger entries found.
      </td>
    </tr>
  );
}

function LabelValue({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#E9EEF5] bg-white px-3 py-2.5">
      <p className="text-[11px] font-medium text-[#667085]">{label}</p>
      <div className={["mt-1 text-[12px] font-semibold text-[#111827]", valueClassName].join(" ")}>
        {value}
      </div>
    </div>
  );
}

export default function LedgerEntriesTable({
  company,
  onViewInvoice,
  onDownloadInvoice,
  busyAction,
}: Props) {
  const companyLabel =
    company.companyName?.trim() ||
    company.companyShort?.trim() ||
    `Client ${company.id}`;

  const hasEntries = company.entries.length > 0;

  return (
    <section className="overflow-hidden rounded-[14px] border border-[#CDD6E1] bg-white">
      <div className="border-b border-[#D9E1EA] px-4 py-4 sm:px-5 sm:py-5 lg:px-[22px]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
              <h2 className="whitespace-nowrap text-[15px] font-semibold leading-none text-[#111827]">
                Company Name :
              </h2>
              <p className="truncate text-[13px] font-medium leading-none text-[#1F2937]">
                {companyLabel}
              </p>
            </div>

            <p className="mt-2 text-[12px] text-[#667085]">
              Review all ledger transactions, invoice actions, and payment breakdowns in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#F3F6FA] px-3 py-1 text-[12px] font-medium text-[#475467]">
              Total Entries: {company.entries.length}
            </span>

            <span className="inline-flex items-center rounded-full bg-[#EEF6FF] px-3 py-1 text-[12px] font-medium text-[#0F5EA8] md:hidden">
              Swipe to explore
            </span>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="border-b border-[#EEF2F6] px-4 py-3 text-[12px] text-[#667085] lg:px-[22px]">
          Scroll horizontally to view complete details. Header stays fixed for easier reading.
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1060px] lg:min-w-[1120px] xl:min-w-[1240px]">
            <div className="max-h-[560px] overflow-y-auto overflow-x-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <DesktopHeaderCell stickyLeft className="min-w-[140px]">
                      Entry ID
                    </DesktopHeaderCell>

                    <DesktopHeaderCell className="min-w-[180px]">
                      Transaction ID
                    </DesktopHeaderCell>

                    <DesktopHeaderCell className="min-w-[180px]">
                      Client
                    </DesktopHeaderCell>

                    <DesktopHeaderCell className="min-w-[190px]">
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

                    <DesktopHeaderCell stickyRight className="min-w-[188px]">
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
                          className={`${rowBg} border-b border-[#EEF2F6] align-top transition-colors hover:bg-[#F6F9FC]`}
                        >
                          <DesktopCell
                            stickyLeft
                            rowBg={rowBg}
                            className="h-[72px] font-semibold text-[#374151]"
                          >
                            <div className="py-4">
                              <span className="inline-flex rounded-[6px] bg-[#F3F6FA] px-2 py-1 text-[11px] font-semibold text-[#374151]">
                                LE{String(entry.entryId).padStart(6, "0")}
                              </span>
                            </div>
                          </DesktopCell>

                          <DesktopCell className="font-medium text-[#748092]">
                            <div className="max-w-[180px] break-words py-4 leading-[1.45]">
                              {entry.transactionId}
                            </div>
                          </DesktopCell>

                          <DesktopCell className="font-medium text-[#374151]">
                            <div className="max-w-[180px] break-words py-4 leading-[1.45]">
                              {entry.client}
                            </div>
                          </DesktopCell>

                          <DesktopCell className="font-medium text-[#6B7280]">
                            <div className="max-w-[190px] break-words py-4 leading-[1.45]">
                              {entry.dateTime}
                            </div>
                          </DesktopCell>

                          <DesktopCell className="font-semibold text-[#16A34A]">
                            <div className="py-4">{formatMoney(entry.receivedAmount)}</div>
                          </DesktopCell>

                          <DesktopCell className="font-semibold text-[#D97706]">
                            <div className="py-4">{formatMoney(entry.pendingAmount)}</div>
                          </DesktopCell>

                          <DesktopCell className="font-semibold text-[#16A34A]">
                            <div className="py-4">{formatMoney(entry.amount)}</div>
                          </DesktopCell>

                          <DesktopCell
                            stickyRight
                            rowBg={rowBg}
                            className="text-center"
                          >
                            <div className="flex min-h-[72px] items-center justify-center py-3">
                              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-center">
                                <button
                                  type="button"
                                  onClick={() => onViewInvoice?.(entry)}
                                  disabled={!!busyAction}
                                  className="inline-flex h-[32px] min-w-[88px] items-center justify-center gap-[6px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[11px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
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
                                  className="inline-flex h-[32px] min-w-[112px] items-center justify-center gap-[6px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[11px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  <Download
                                    className="h-[13px] w-[13px]"
                                    strokeWidth={1.9}
                                  />
                                  {isDownloading ? "Downloading..." : "Download"}
                                </button>
                              </div>
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

      <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
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
                className="rounded-[14px] border border-[#E5E7EB] bg-[#FCFCFD] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#111827]">
                      LE{String(entry.entryId).padStart(6, "0")}
                    </p>
                    <p className="mt-1 break-words text-[12px] text-[#6B7280]">
                      {entry.transactionId}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-[#F3F6FA] px-2.5 py-1 text-[11px] font-medium text-[#475467]">
                    Entry
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <LabelValue label="Client" value={entry.client} />
                  <LabelValue label="Date & Time" value={entry.dateTime} />
                  <LabelValue
                    label="Received Amount"
                    value={formatMoney(entry.receivedAmount)}
                    valueClassName="text-[#16A34A]"
                  />
                  <LabelValue
                    label="Pending Amount"
                    value={formatMoney(entry.pendingAmount)}
                    valueClassName="text-[#D97706]"
                  />
                  <div className="sm:col-span-2">
                    <LabelValue
                      label="Total Amount"
                      value={formatMoney(entry.amount)}
                      valueClassName="text-[#16A34A]"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 xs:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onViewInvoice?.(entry)}
                    disabled={!!busyAction}
                    className="inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Eye className="h-[14px] w-[14px]" strokeWidth={1.9} />
                    {isViewing ? "Opening..." : "View Invoice"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownloadInvoice?.(entry)}
                    disabled={!!busyAction}
                    className="inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Download className="h-[14px] w-[14px]" strokeWidth={1.9} />
                    {isDownloading ? "Downloading..." : "Download"}
                  </button>
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