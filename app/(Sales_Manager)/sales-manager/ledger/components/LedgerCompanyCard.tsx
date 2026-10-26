"use client";

import Link from "next/link";
import { Building2, Eye, FileText } from "lucide-react";
import { LedgerCompany, formatMoney } from "../data/ledgerData";

type Props = {
  company?: LedgerCompany | null;
  basePath?: string;
};

function safeText(value?: string | null, fallback = "N/A") {
  return value && value.trim() ? value : fallback;
}

function AmountBlock({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-[150px] rounded-[12px] border border-[#EEF2F6] bg-[#FBFCFD] px-4 py-3">
      <p className="text-[11px] font-medium text-[#6B7280]">{label}</p>
      <p
        className={`mt-1 truncate text-[15px] font-semibold sm:text-[16px] ${
          valueClassName ?? "text-[#111827]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function LedgerCompanyCard({
  company,
  basePath = "/sales-manager/ledger",
}: Props) {
  if (!company) return null;

  const clientId = company.clientId;

  return (
    <article className="w-full overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto no-scrollbar p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(260px,1.6fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)_minmax(96px,auto)] xl:items-center xl:gap-4">
          
          {/* LEFT SECTION */}
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEF6FF] text-[#2563EB]">
                <Building2 className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold text-[#111827] sm:text-[16px]">
                  {safeText(company.companyName, "Unnamed Company")}
                </h3>

                <div className="mt-1 text-[12px] text-[#4B5563]">
                  {safeText(company.companyShort)}
                </div>

                <div className="mt-2 flex flex-col gap-1 text-[12px] text-[#6B7280] sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                  <span className="truncate break-all sm:break-normal">
                    {safeText(company.email)}
                  </span>

                  <span className="hidden sm:inline text-[#CBD5E1]">|</span>

                  <span className="truncate">
                    {safeText(company.phone)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GST */}
          <div className="min-w-0 rounded-[12px] border border-[#EEF2F6] bg-[#FBFCFD] px-4 py-3">
            <div className="flex items-start gap-2">
              <FileText className="mt-[1px] h-[14px] w-[14px] text-[#6B7280]" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#6B7280]">GST Number</p>
                <p className="mt-1 truncate text-[13px] font-semibold text-[#111827]">
                  {safeText(company.gstNumber)}
                </p>
              </div>
            </div>
          </div>

          {/* DESKTOP STATS */}
          <div className="hidden xl:block">
            <AmountBlock
              label="Pending Amt."
              value={formatMoney(company.pendingAmt)}
              valueClassName="text-[#D97706]"
            />
          </div>

          <div className="hidden xl:block">
            <AmountBlock
              label="Revenue"
              value={formatMoney(company.revenue)}
              valueClassName="text-[#2563EB]"
            />
          </div>

          <div className="hidden xl:block">
            <AmountBlock
              label="Total Amt."
              value={formatMoney(company.totalAmt)}
              valueClassName="text-[#16A34A]"
            />
          </div>

          {/* ACTION */}
          <div className="min-w-0 xl:min-w-[96px]">
            <div className="flex w-full xl:justify-end">
              {clientId ? (
                <Link
                  href={`${basePath}/${clientId}`}
                  className="inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#4B5563] px-4 text-[13px] text-white hover:bg-[#374151] active:scale-[0.98] sm:w-auto"
                >
                  <Eye className="h-[15px] w-[15px]" />
                  View
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex h-[38px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-[9px] bg-[#9CA3AF] px-4 text-[13px] text-white sm:w-auto"
                >
                  <Eye className="h-[15px] w-[15px]" />
                  No ID
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE STATS */}
        <div className="mt-4 xl:hidden">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-3">
              <AmountBlock
                label="Pending Amt."
                value={formatMoney(company.pendingAmt)}
                valueClassName="text-[#D97706]"
              />
              <AmountBlock
                label="Revenue"
                value={formatMoney(company.revenue)}
                valueClassName="text-[#2563EB]"
              />
              <AmountBlock
                label="Total Amt."
                value={formatMoney(company.totalAmt)}
                valueClassName="text-[#16A34A]"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}