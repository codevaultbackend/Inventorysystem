"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import LedgerStatsCards from "./components/LedgerStatsCards";
import LedgerInfoBanner from "./components/LedgerInfoBanner";
import LedgerEmptyState from "./components/LedgerEmptyState";
import LedgerCompanyList from "./components/LedgerCompanyList";
import {
  LedgerCompany,
  LedgerApiResponse,
  normalizeLedgerClients,
} from "./data/ledgerData";

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<LedgerCompany[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") ||
              localStorage.getItem("token") ||
              localStorage.getItem("authToken")
            : null;

        const res = await axios.get<LedgerApiResponse>(
          `${baseUrl}/sales/get-ladger`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          }
        );

        const normalized = normalizeLedgerClients(res.data?.clients || []);
        setCompanies(normalized);
      } catch (err: any) {
        console.error("Ledger fetch error:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load ledger data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) {
      fetchLedger();
    } else {
      setLoading(false);
      setError("API base URL is missing.");
    }
  }, [baseUrl]);

  const activeCompanies = useMemo(
    () =>
      companies.filter(
        (company) =>
          Number(company.totalEntries) > 0 ||
          Number(company.totalAmt) > 0 ||
          Number(company.pendingAmt) > 0 ||
          Number(company.revenue) > 0
      ),
    [companies]
  );

  const stats = useMemo(() => {
    const totalEntries = activeCompanies.reduce(
      (sum, company) => sum + Number(company.totalEntries || 0),
      0
    );

    const totalRevenue = activeCompanies.reduce(
      (sum, company) => sum + Number(company.revenue || 0),
      0
    );

    const totalPending = activeCompanies.reduce(
      (sum, company) => sum + Number(company.pendingAmt || 0),
      0
    );

    const totalAmount = activeCompanies.reduce(
      (sum, company) => sum + Number(company.totalAmt || 0),
      0
    );

    return {
      monthlyRevenueTop: "₹0",
      monthlyRevenuePercent: totalAmount > 0 ? "Active" : "0",
      monthlyRevenueLabel: "Month’s Revenue",
      activeClients: activeCompanies.length,
      pendingAmount: totalPending,
      pendingThisWeekText: `${activeCompanies.length} active`,
      todaysEntries: totalEntries,
      totalRevenue,
    };
  }, [activeCompanies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 lg:p-5">
        <div className="mx-auto max-w-[1400px] rounded-[24px] bg-[#F8FAFC] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-5">
          <div className="animate-pulse space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-[112px] rounded-[16px] bg-white" />
              <div className="h-[112px] rounded-[16px] bg-white" />
              <div className="h-[112px] rounded-[16px] bg-white" />
              <div className="h-[112px] rounded-[16px] bg-white" />
            </div>

            <div className="h-[110px] rounded-[16px] bg-[#EEF2FF]" />

            <div className="space-y-4">
              <div className="h-[150px] rounded-[16px] bg-white" />
              <div className="h-[150px] rounded-[16px] bg-white" />
              <div className="h-[150px] rounded-[16px] bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex min-h-[420px] max-w-[1400px] items-center justify-center rounded-[24px] bg-[#F8FAFC] p-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-[24px] font-semibold text-[#111827]">
              Ledger unavailable
            </h2>
            <p className="mt-3 text-[14px] text-[#6B7280]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1 pt-[5px] sm:p-2 lg:p-1">
      <div className="mx-auto max-w-[1400px] rounded-[24px] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-2 lg:p-2">
        <div className="space-y-5">
          <LedgerStatsCards stats={stats} />
          <LedgerInfoBanner />

          {activeCompanies.length === 0 ? (
            <LedgerEmptyState />
          ) : (
            <LedgerCompanyList companies={activeCompanies} />
          )}
        </div>
      </div>
    </div>
  );
}