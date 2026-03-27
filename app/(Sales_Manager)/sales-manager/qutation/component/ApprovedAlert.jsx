"use client";

import { CheckCircle2 } from "lucide-react";

export default function ApprovedAlert() {
  return (
    <div className="rounded-[14px] border border-[#B7E7C0] bg-[#EDF8EF] px-5 py-5 shadow-[0_2px_10px_rgba(34,197,94,0.04)]">
      <div className="flex items-start gap-3">
        <CheckCircle2
          size={24}
          className="mt-[1px] shrink-0 text-[#16A34A]"
          strokeWidth={2.2}
        />

        <div className="min-w-0">
          <p className="text-[18px] font-[700] text-[#166534]">
            Quotation Approved
          </p>

          <p className="mt-2 max-w-[760px] text-[15px] leading-[1.65] text-[#166534]">
            This quotation has been approved. Invoice has been generated and items
            have been added to the dispatch queue.
          </p>
        </div>
      </div>
    </div>
  );
}