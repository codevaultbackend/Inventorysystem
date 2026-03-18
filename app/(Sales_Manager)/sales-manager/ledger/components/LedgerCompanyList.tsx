"use client";

import { useMemo, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import LedgerCompanyCard from "./LedgerCompanyCard";
import { LedgerCompany, LedgerEntry } from "../data/ledgerData";

type Props = {
  companies?: LedgerCompany[];
};

type FlatInvoiceItem = {
  company: LedgerCompany;
  entry: LedgerEntry;
};

const parseLedgerDate = (value: string) => {
  if (!value) return 0;

  // expected: 20/02/2026, 16:04:26
  const [datePart = "", timePart = "00:00:00"] = value.split(",");
  const [dd = "01", mm = "01", yyyy = "1970"] = datePart.trim().split("/");
  const [hh = "00", min = "00", sec = "00"] = timePart.trim().split(":");

  const date = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min),
    Number(sec)
  );

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export default function LedgerCompanyList({ companies = [] }: Props) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"default" | "date" | "amount">(
    "default"
  );

  const allInvoices = useMemo<FlatInvoiceItem[]>(() => {
    if (!Array.isArray(companies)) return [];

    return companies.flatMap((company) =>
      Array.isArray(company.entries)
        ? company.entries.map((entry) => ({ company, entry }))
        : []
    );
  }, [companies]);

  const filteredInvoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let result = allInvoices.filter(({ company, entry }) => {
      if (!normalized) return true;

      return (
        company.companyName.toLowerCase().includes(normalized) ||
        company.companyShort.toLowerCase().includes(normalized) ||
        entry.client.toLowerCase().includes(normalized) ||
        entry.entryId.toLowerCase().includes(normalized) ||
        entry.transactionId.toLowerCase().includes(normalized) ||
        entry.billNumber.toLowerCase().includes(normalized)
      );
    });

    if (sortMode === "amount") {
      result = [...result].sort((a, b) => b.entry.amount - a.entry.amount);
    }

    if (sortMode === "date") {
      result = [...result].sort(
        (a, b) => parseLedgerDate(b.entry.dateTime) - parseLedgerDate(a.entry.dateTime)
      );
    }

    return result;
  }, [allInvoices, query, sortMode]);

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5EAF0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#EEF2F6] px-[20px] py-[18px]">
        <h2 className="text-[15px] font-semibold leading-[20px] text-[#111827]">
          All Invoice Entries
        </h2>
      </div>

      <div className="flex flex-col gap-[12px] border-b border-[#EEF2F6] px-[16px] py-[14px] sm:flex-row sm:items-center sm:justify-between sm:px-[20px]">
        <div className="relative w-full sm:max-w-[290px]">
          <Search className="pointer-events-none absolute left-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID or Client Name..."
            className="h-[40px] w-full rounded-[10px] border border-[#E5E7EB] bg-[#FCFCFD] pl-[36px] pr-[12px] text-[13px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#D1D5DB]"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            setSortMode((prev) =>
              prev === "default" ? "date" : prev === "date" ? "amount" : "default"
            )
          }
          className="inline-flex h-[40px] items-center gap-[8px] rounded-[10px] border border-[#E5E7EB] bg-[#FCFCFD] px-[14px] text-[13px] font-medium text-[#6B7280] transition hover:bg-white"
        >
          <ListFilter className="h-[14px] w-[14px]" strokeWidth={2} />
          {sortMode === "default"
            ? "Sort by Date / Ammount"
            : sortMode === "date"
            ? "Sorted by Date"
            : "Sorted by Amount"}
        </button>
      </div>

      <div className="space-y-[14px] px-[16px] py-[20px] sm:px-[28px] sm:py-[20px]">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map(({ company, entry }) => (
            <LedgerCompanyCard
              key={`${company.id}-${entry.id}`}
              company={company}
              entry={entry}
            />
          ))
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#D7DEE7] bg-[#FAFBFC] px-[18px] py-[26px] text-center text-[14px] text-[#6B7280]">
            No invoice entries found.
          </div>
        )}
      </div>
    </section>
  );
}