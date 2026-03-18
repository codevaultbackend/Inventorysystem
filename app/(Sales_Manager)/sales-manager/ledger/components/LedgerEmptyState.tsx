"use client";

import { BookOpen } from "lucide-react";

export default function LedgerEmptyState() {
  return (
    <section className="overflow-hidden rounded-[14px] border border-[#D7DEE7] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#E5EAF1] px-[20px] py-[20px]">
        <h2 className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-[#111827]">
          Ledger Entries
        </h2>
      </div>

      <div className="flex min-h-[242px] flex-col items-center justify-center px-6 text-center">
        <BookOpen
          className="h-[54px] w-[54px] text-[#C7CED8]"
          strokeWidth={1.7}
        />

        <p className="mt-[16px] text-[18px] font-medium leading-[22px] tracking-[-0.01em] text-[#6B7280]">
          No ledger entries yet
        </p>

        <p className="mt-[8px] max-w-[360px] text-[12px] leading-[18px] text-[#9CA3AF]">
          Entries are automatically created when quotations are approved
        </p>
      </div>
    </section>
  );
}