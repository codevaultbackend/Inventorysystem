"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import LedgerStatsCards from "./components/LedgerStatsCards";
import LedgerInfoBanner from "./components/LedgerInfoBanner";
import LedgerEmptyState from "./components/LedgerEmptyState";
import LedgerCompanyList from "./components/LedgerCompanyList";
import {
  LedgerCompany,
  normalizeLedgerClients,
} from "./data/ledgerData";

type LedgerApiShape = {
  success?: boolean;
  message?: string;
  clients?: any[];
  data?: {
    clients?: any[];
    ledger?: any[];
    companies?: any[];
    rows?: any[];
  };
  ledger?: any[];
  companies?: any[];
  rows?: any[];
};

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-swp9.onrender.com"
  ).replace(/\/+$/, "");
}

function extractLedgerArray(payload: LedgerApiShape): any[] {
  if (Array.isArray(payload?.clients)) return payload.clients;
  if (Array.isArray(payload?.data?.clients)) return payload.data.clients;
  if (Array.isArray(payload?.ledger)) return payload.ledger;
  if (Array.isArray(payload?.data?.ledger)) return payload.data.ledger;
  if (Array.isArray(payload?.companies)) return payload.companies;
  if (Array.isArray(payload?.data?.companies)) return payload.data.companies;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  return [];
}

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<LedgerCompany[]>([]);

  const baseUrl = getApiBaseUrl();

  useEffect(() => {
    let ignore = false;

    const fetchLedger = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();

        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined;

        const endpoints = [
          `${baseUrl}/sales/get-ladger`,
          `${baseUrl}/sales/get-ledger`,
        ];

        let lastError: any = null;
        let responseData: LedgerApiShape | null = null;

        for (const endpoint of endpoints) {
          try {
            const res = await axios.get<LedgerApiShape>(endpoint, {
              headers,
              withCredentials: true,
            });

            responseData = res.data;
            break;
          } catch (err: any) {
            lastError = err;

            const status = err?.response?.status;

            if (status === 401 || status === 403) {
              throw err;
            }

            if (status && status !== 404) {
              throw err;
            }
          }
        }

        if (!responseData) {
          throw lastError || new Error("Failed to load ledger data.");
        }

        const rawClients = extractLedgerArray(responseData);
        const normalized = normalizeLedgerClients(rawClients || []);

        if (!ignore) {
          setCompanies(normalized);
        }
      } catch (err: any) {
        console.error("Ledger fetch error:", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load ledger data.";

        if (!ignore) {
          setError(message);
        }

        if (err?.response?.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("ims_token");
          localStorage.removeItem("imsToken");
          localStorage.removeItem("jwt");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchLedger();

    return () => {
      ignore = true;
    };
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
      <div className="min-h-screen  ">
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
    <div className="min-h-screen p-1 ">
      <div className="mx-auto max-w-[1400px] rounded-[24px] ">
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