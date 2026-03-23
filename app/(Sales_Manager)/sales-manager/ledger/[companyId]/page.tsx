"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { notFound, useParams } from "next/navigation";
import LedgerEntriesTable from "../components/LedgerEntriesTable";

export type ClientLedgerEntry = {
  entryId: number;
  transactionId: string;
  client: string;
  dateTime: string;
  amount: number;
  receivedAmount: number;
  pendingAmount: number;
};

export type ClientLedgerResponse = {
  success: boolean;
  totalEntries: number;
  ledger: ClientLedgerEntry[];
};

export type LedgerClientDetails = {
  id: number;
  companyName: string;
  totalEntries: number;
  entries: ClientLedgerEntry[];
};

export default function CompanyLedgerEntriesPage() {
  const params = useParams();
  const companyId = String(params?.companyId || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState<LedgerClientDetails | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    if (!companyId) return;

    const fetchClientLedger = async () => {
      try {
        setLoading(true);
        setError("");
        setNotFoundState(false);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") ||
              localStorage.getItem("token") ||
              localStorage.getItem("authToken")
            : null;

        const res = await axios.get<ClientLedgerResponse>(
          `${baseUrl}/sales/get-ladger/${companyId}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          }
        );

        const ledgerEntries = res.data?.ledger || [];
        const firstEntry = ledgerEntries[0];

        setCompany({
          id: Number(companyId),
          companyName: firstEntry?.client || `Client ${companyId}`,
          totalEntries: Number(res.data?.totalEntries || 0),
          entries: ledgerEntries,
        });
      } catch (err: any) {
        console.error("Client ledger fetch error:", err);

        if (err?.response?.status === 404) {
          setNotFoundState(true);
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load client ledger details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) {
      fetchClientLedger();
    } else {
      setLoading(false);
      setError("API base URL is missing.");
    }
  }, [companyId, baseUrl]);

  const pageTitle = useMemo(() => {
    if (!company) return "Ledger Entries";
    return `${company.companyName} Ledger Entries`;
  }, [company]);

  if (notFoundState) return notFound();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 lg:p-6">
        <div className="mx-auto max-w-[1400px] rounded-[24px] bg-[#F8FAFC] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-[32px] w-[260px] rounded bg-white" />
            <div className="h-[60px] rounded-[12px] bg-white" />
            <div className="h-[420px] rounded-[14px] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 lg:p-6">
        <div className="mx-auto flex min-h-[420px] max-w-[1400px] items-center justify-center rounded-[24px] bg-[#F8FAFC] p-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-[24px] font-semibold text-[#111827]">
              Unable to load ledger details
            </h2>
            <p className="mt-3 text-[14px] text-[#6B7280]">
              {error || "Something went wrong."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-[1400px] rounded-[24px] bg-[#F8FAFC] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="mb-4">
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[24px]">
            {pageTitle}
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Total Entries: {company.totalEntries}
          </p>
        </div>

        <LedgerEntriesTable company={company} />
      </div>
    </div>
  );
}