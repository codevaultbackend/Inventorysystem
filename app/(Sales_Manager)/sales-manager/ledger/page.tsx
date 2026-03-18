"use client";

import LedgerStatsCards from "./components/LedgerStatsCards";
import LedgerInfoBanner from "./components/LedgerInfoBanner";
import LedgerEmptyState from "./components/LedgerEmptyState";
import LedgerCompanyList from "./components/LedgerCompanyList";
import { ledgerCompanies } from "./data/ledgerData";

export default function LedgerPage() {
  const useEmptyScreenFirst = false;

  const companies = useEmptyScreenFirst ? [] : ledgerCompanies;
  const todaysEntries = companies.reduce(
    (sum, company) => sum + company.entriesToday,
    0
  );

  return (
    <div className="min-h-screen bg-[#F6F8FB]  p-2 pt-[15px]">
      <div className="mx-auto max-w-[1400px] rounded-[24px] bg-[#F8FAFC]  shadow-[0_20px_50px_rgba(15,23,42,0.06)] ">
        <div className="space-y-5">
          <LedgerStatsCards todaysEntries={todaysEntries} />
          <LedgerInfoBanner />

          {companies.length === 0 ? (
            <LedgerEmptyState />
          ) : (
            <LedgerCompanyList companies={companies} />
          )}
        </div>
      </div>
    </div>
  );
}