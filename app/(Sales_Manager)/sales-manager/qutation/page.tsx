"use client";

import { useState } from "react";
import QuotationCard from "./component/QuotationCard";
import QuotationModal from "./component/QuotationModal";
import StatsSection from "./component/StatsSection";

export interface Quotation {
  id: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function Page() {

  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  const quotations: Quotation[] = [
    { id: "QT338540", status: "Pending" },
    { id: "QT338540", status: "Rejected" },
    { id: "QT338540", status: "Pending" },
    { id: "QT338540", status: "Pending" },
    { id: "QT338540", status: "Approved" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6">

      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* Header */}
        <StatsSection />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[16px] font-semibold text-[#111827]">
            All Quotations Entries
          </h2>

          <button className="bg-[#111827] text-white px-4 py-2 text-[13px] rounded-lg">
            + Create Quotation
          </button>
        </div>

        {/* Search */}

        <div className="flex justify-between mb-6">

          <input
            placeholder="Search by ID or Client Name..."
            className="border border-[#E5E7EB] rounded-lg px-4 h-[38px] text-[13px] w-[260px]"
          />

          <button className="border border-[#E5E7EB] rounded-lg px-4 h-[38px] text-[13px]">
            Sort by Date / Amount
          </button>

        </div>

        {/* List */}

        <div className="flex flex-col gap-3">

          {quotations.map((q, index) => (
            <QuotationCard
              key={index}
              data={q}
              onView={() => setSelectedQuote(q)}
            />
          ))}

        </div>

      </div>

      {/* Modal */}

      {selectedQuote && (
        <QuotationModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}

    </div>
  );
}