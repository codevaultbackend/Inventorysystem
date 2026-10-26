"use client";

import { useMemo, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import LedgerCompanyCard from "./LedgerCompanyCard";
import { LedgerCompany } from "../data/ledgerData";

type Props = {
  companies?: LedgerCompany[];
};

type SortMode = "default" | "amount" | "pending" | "entries";

export default function LedgerCompanyList({ companies = [] }: Props) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let result = companies.filter((company) => {
      if (!normalized) return true;

      return (
        String(company.companyName || "")
          .toLowerCase()
          .includes(normalized) ||
        String(company.companyShort || "")
          .toLowerCase()
          .includes(normalized) ||
        String(company.email || "")
          .toLowerCase()
          .includes(normalized) ||
        String(company.phone || "")
          .toLowerCase()
          .includes(normalized) ||
        String(company.gstNumber || "")
          .toLowerCase()
          .includes(normalized) ||
        String(company.clientId).includes(normalized)
      );
    });

    if (sortMode === "amount") {
      result = [...result].sort((a, b) => b.totalAmt - a.totalAmt);
    }

    if (sortMode === "pending") {
      result = [...result].sort((a, b) => b.pendingAmt - a.pendingAmt);
    }

    if (sortMode === "entries") {
      result = [...result].sort((a, b) => b.totalEntries - a.totalEntries);
    }

    return result;
  }, [companies, query, sortMode]);

  const sortLabel =
    sortMode === "default"
      ? "Sort by Amount / Pending / Entries"
      : sortMode === "amount"
      ? "Sorted by Amount"
      : sortMode === "pending"
      ? "Sorted by Pending"
      : "Sorted by Entries";

  const handleSortToggle = () => {
    setSortMode((prev) =>
      prev === "default"
        ? "amount"
        : prev === "amount"
        ? "pending"
        : prev === "pending"
        ? "entries"
        : "default"
    );
  };

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5EAF0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#EEF2F6] px-4 py-4 sm:px-5 sm:py-[18px]">
        <h2 className="text-[15px] font-semibold leading-[20px] text-[#111827] sm:text-[16px]">
          All Ledger Entries
        </h2>
      </div>

      <div className="flex flex-col gap-3 border-b border-[#EEF2F6] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[320px]">
          <Search className="pointer-events-none absolute left-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, email, phone..."
            className="h-[40px] w-full rounded-[10px] border border-[#E5E7EB] bg-[#FCFCFD] pl-[36px] pr-[12px] text-[13px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#D1D5DB]"
          />
        </div>

        <button
          type="button"
          onClick={handleSortToggle}
          className="inline-flex h-[40px] w-full items-center justify-center gap-[8px] rounded-[10px] border border-[#E5E7EB] bg-[#FCFCFD] px-[14px] text-[13px] font-medium text-[#6B7280] transition hover:bg-white sm:w-auto sm:justify-start"
        >
          <ListFilter className="h-[14px] w-[14px] shrink-0" strokeWidth={2} />
          <span className="truncate">{sortLabel}</span>
        </button>
      </div>

      <div className="space-y-3 px-4 py-4 sm:space-y-[14px] sm:px-5 sm:py-5 lg:px-7">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <LedgerCompanyCard key={company.clientId} company={company} />
          ))
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#D7DEE7] bg-[#FAFBFC] px-[18px] py-[26px] text-center text-[14px] text-[#6B7280]">
            No ledger entries found.
          </div>
        )}
      </div>
    </section>
  );
}