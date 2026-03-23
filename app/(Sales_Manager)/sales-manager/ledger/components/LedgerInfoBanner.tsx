"use client";

import { BookOpen } from "lucide-react";

export default function LedgerInfoBanner() {
  return (
    <div className="w-full rounded-[16px] border border-[#C7D2FE] bg-[#EEF2FF] px-[22px] py-[18px] shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-[14px]">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <BookOpen
            className="h-[18px] w-[18px] text-[#4F46E5]"
            strokeWidth={2}
          />
        </div>

        <div>
          <h3 className="text-[15px] font-semibold leading-[20px] tracking-[-0.01em] text-[#2F35A6] sm:text-[16px]">
            Automated Ledger Updates
          </h3>

          <p className="mt-[6px] max-w-[920px] text-[12px] leading-[18px] text-[#4E56B8] sm:text-[13px]">
            The ledger is automatically updated when a quotation is approved.
            Each entry records the sale amount, client information, and
            timestamp for complete financial traceability.
          </p>
        </div>
      </div>
    </div>
  );
}