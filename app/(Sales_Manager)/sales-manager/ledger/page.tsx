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

type LedgerClientApiItem = {
  clientId?: number;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  branchId?: number | string | null;
  gstNumber?: string | null;
  totalEntries?: number | string | null;
  totalAmount?: number | string | null;
  pendingAmount?: number | string | null;
  revenue?: number | string | null;
};

type LedgerBranchGroupApiItem = {
  branchId?: number | string | null;
  totalClients?: number | string | null;
  totalEntries?: number | string | null;
  totalAmount?: number | string | null;
  pendingAmount?: number | string | null;
  revenue?: number | string | null;
  clients?: LedgerClientApiItem[] | null;
};

type LedgerBranchSummaryItem = {
  branchId?: number | string | null;
  totalClients?: number | string | null;
  totalEntries?: number | string | null;
  totalAmount?: number | string | null;
  revenue?: number | string | null;
  pendingAmount?: number | string | null;
};

type LedgerApiShape = {
  success?: boolean;
  message?: string;
  clients?: LedgerBranchGroupApiItem[] | LedgerClientApiItem[];
  branchSummary?: LedgerBranchSummaryItem[];
};

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getStoredToken() {
  if (typeof window === "undefined") return "";

  const localToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt");

  if (localToken) return localToken;

  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return cookieToken || "";
}

function clearStoredTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("ims_token");
  localStorage.removeItem("imsToken");
  localStorage.removeItem("jwt");
}

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://ims-backend-nm9g.onrender.com"
  ).replace(/\/+$/, "");
}

function isGroupedLedgerResponse(
  clients: LedgerBranchGroupApiItem[] | LedgerClientApiItem[] | undefined
): clients is LedgerBranchGroupApiItem[] {
  return (
    Array.isArray(clients) &&
    clients.length > 0 &&
    typeof clients[0] === "object" &&
    clients[0] !== null &&
    "clients" in clients[0]
  );
}

function getCompanyShort(companyName?: string | null, email?: string | null) {
  const cleanName = String(companyName || "").trim();

  if (cleanName) {
    const short = cleanName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    if (short) return short;
  }

  const emailPrefix = String(email || "").split("@")[0]?.trim();
  if (emailPrefix) return emailPrefix.slice(0, 2).toUpperCase();

  return "NA";
}

function normalizeFlatClientsToCompanies(
  rawClients: LedgerClientApiItem[]
): LedgerCompany[] {
  return rawClients.map((item, index) => ({
    clientId: Number(item?.clientId ?? index + 1),
    companyName:
      String(item?.companyName || "").trim() || item?.email || `Client ${index + 1}`,
    companyShort: getCompanyShort(item?.companyName, item?.email),
    email: item?.email || "-",
    phone: item?.phone || "-",
    branchId: Number(item?.branchId ?? 0),
    gstNumber: item?.gstNumber || "N/A",
    totalEntries: toNumber(item?.totalEntries),
    totalAmt: toNumber(item?.totalAmount),
    pendingAmt: toNumber(item?.pendingAmount),
    revenue: toNumber(item?.revenue),
  }));
}

function buildBranchSummaryFromFlatClients(
  rawClients: LedgerClientApiItem[]
): LedgerBranchSummaryItem[] {
  const grouped = new Map<string, LedgerBranchSummaryItem>();

  rawClients.forEach((client) => {
    const key = String(client?.branchId ?? "0");

    if (!grouped.has(key)) {
      grouped.set(key, {
        branchId: client?.branchId ?? 0,
        totalClients: 0,
        totalEntries: 0,
        totalAmount: 0,
        pendingAmount: 0,
        revenue: 0,
      });
    }

    const existing = grouped.get(key)!;

    existing.totalClients = toNumber(existing.totalClients) + 1;
    existing.totalEntries =
      toNumber(existing.totalEntries) + toNumber(client?.totalEntries);
    existing.totalAmount =
      toNumber(existing.totalAmount) + toNumber(client?.totalAmount);
    existing.pendingAmount =
      toNumber(existing.pendingAmount) + toNumber(client?.pendingAmount);
    existing.revenue =
      toNumber(existing.revenue) + toNumber(client?.revenue);
  });

  return Array.from(grouped.values());
}

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<LedgerCompany[]>([]);
  const [branchSummary, setBranchSummary] = useState<LedgerBranchSummaryItem[]>([]);

  useEffect(() => {
    let ignore = false;

    const fetchLedger = async () => {
      try {
        setLoading(true);
        setError("");

        const baseUrl = getApiBaseUrl();
        const token = getStoredToken();

        const res = await axios.get<LedgerApiShape>(
          `${baseUrl}/sales/get-ladger`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
            withCredentials: true,
          }
        );

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Failed to load ledger data.");
        }

        const rawClients = Array.isArray(res.data?.clients) ? res.data.clients : [];
        const rawBranchSummary = Array.isArray(res.data?.branchSummary)
          ? res.data.branchSummary
          : [];

        let normalizedCompanies: LedgerCompany[] = [];
        let normalizedBranchSummary: LedgerBranchSummaryItem[] = rawBranchSummary;

        if (rawClients.length > 0) {
          if (isGroupedLedgerResponse(rawClients)) {
            // SUPER SALES MANAGER FLOW — keep as it is
            normalizedCompanies = normalizeLedgerClients(rawClients);

            if (!normalizedBranchSummary.length) {
              normalizedBranchSummary = rawClients.map((group) => ({
                branchId: group?.branchId ?? 0,
                totalClients: toNumber(
                  group?.totalClients ??
                    (Array.isArray(group?.clients) ? group.clients.length : 0)
                ),
                totalEntries: toNumber(group?.totalEntries),
                totalAmount: toNumber(group?.totalAmount),
                pendingAmount: toNumber(group?.pendingAmount),
                revenue: toNumber(group?.revenue),
              }));
            }
          } else {
            // SALES MANAGER FLOW — flat client array
            const flatClients = rawClients as LedgerClientApiItem[];

            normalizedCompanies = normalizeFlatClientsToCompanies(flatClients);

            if (!normalizedBranchSummary.length) {
              normalizedBranchSummary =
                buildBranchSummaryFromFlatClients(flatClients);
            }
          }
        }

        if (!ignore) {
          setCompanies(normalizedCompanies);
          setBranchSummary(normalizedBranchSummary);

          console.log("Ledger API response:", res.data);
          console.log("Normalized companies:", normalizedCompanies);
          console.log("Normalized branchSummary:", normalizedBranchSummary);
        }
      } catch (err: any) {
        console.error("Ledger fetch error:", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load ledger data.";

        if (!ignore) {
          setError(message);
          setCompanies([]);
          setBranchSummary([]);
        }

        if (err?.response?.status === 401 && typeof window !== "undefined") {
          clearStoredTokens();
          window.location.href = "/login";
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
  }, []);

  const stats = useMemo(() => {
    const totalClientsFromSummary = branchSummary.reduce(
      (sum, item) => sum + toNumber(item?.totalClients),
      0
    );

    const totalEntriesFromSummary = branchSummary.reduce(
      (sum, item) => sum + toNumber(item?.totalEntries),
      0
    );

    const totalAmount = branchSummary.reduce(
      (sum, item) => sum + toNumber(item?.totalAmount),
      0
    );

    const totalPendingFromSummary = branchSummary.reduce(
      (sum, item) => sum + toNumber(item?.pendingAmount),
      0
    );

    const totalRevenueFromSummary = branchSummary.reduce(
      (sum, item) => sum + toNumber(item?.revenue),
      0
    );

    const activeClients = companies.filter(
      (company) =>
        company.totalEntries > 0 ||
        company.totalAmt > 0 ||
        company.pendingAmt > 0 ||
        company.revenue > 0
    ).length;

    return {
      monthlyRevenueTop: `₹${(totalAmount || 0).toLocaleString("en-IN")}`,
      monthlyRevenuePercent: `${totalAmount}`,
      monthlyRevenueLabel: "Total Amount",
      activeClients: totalClientsFromSummary || companies.length,
      pendingAmount: totalPendingFromSummary,
      pendingThisWeekText: `${activeClients} active clients`,
      todaysEntries: totalEntriesFromSummary,
      totalRevenue: totalRevenueFromSummary,
    };
  }, [branchSummary, companies]);

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
      <div className="min-h-screen">
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
    <div className="min-h-screen p-1">
      <div className="mx-auto max-w-[1400px] rounded-[24px]">
        <div className="space-y-5">
          <LedgerStatsCards stats={stats} />
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