"use client";

import { BsCheckCircleFill } from "react-icons/bs";

export default function ApprovedAlert() {
  return (
    <div className="mb-5 flex items-start gap-[10px] rounded-[12px] border border-[#C9EED8] bg-[#E8F7EF] p-[16px]">
      <BsCheckCircleFill className="mt-[2px] text-[#22C55E]" />

      <div>
        <p className="text-[14px] font-semibold text-[#065F46]">
          Quotation Approved Updates
        </p>

        <p className="mt-[2px] text-[13px] text-[#065F46]">
          This quotation has been approved. Invoice has been generated and items
          have been added to the dispatch queue.
        </p>
      </div>
    </div>
  );
}