"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export type ClientLedgerEntry = {
  entryId: number;
  transactionId: string;
  client: string;
  dateTime: string;
  amount: number;
  receivedAmount: number;
  pendingAmount: number;
  quotationId?: number | null;
  quotation_id?: number | null;
  invoiceId?: number | null;
  invoice_id?: number | null;
};

export type LedgerClientDetails = {
  id: number;
  companyName: string;
  totalEntries: number;
  entries: ClientLedgerEntry[];
};

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://ims-backend-nm9g.onrender.com"
  ).replace(/\/+$/, "");
}

export function useClientLedger(companyId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState<LedgerClientDetails | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const controller = new AbortController();

    const fetchLedger = async () => {
      try {
        setLoading(true);
        setError("");
        setNotFoundState(false);

        const token = getStoredToken();
        const baseUrl = getApiBaseUrl();

        const endpoints = [
          `${baseUrl}/sales/get-ladger/${companyId}`,
          `${baseUrl}/sales/get-ledger/${companyId}`,
        ];

        let responseData: any = null;

        for (const endpoint of endpoints) {
          try {
            const res = await axios.get(endpoint, {
              signal: controller.signal,
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : undefined,
            });

            responseData = res.data;
            break;
          } catch (err: any) {
            if (err?.response?.status === 404) continue;
            throw err;
          }
        }

        if (!responseData) {
          setNotFoundState(true);
          return;
        }

        const ledgerEntries = responseData?.ledger || [];

        setCompany({
          id: Number(companyId),
          companyName:
            ledgerEntries[0]?.client || `Client ${companyId}`,
          totalEntries:
            responseData?.totalEntries || ledgerEntries.length,
          entries: ledgerEntries,
        });
      } catch (err: any) {
        if (axios.isCancel(err)) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load ledger"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();

    return () => controller.abort();
  }, [companyId]);

  return {
    loading,
    error,
    company,
    notFoundState,
  };
}