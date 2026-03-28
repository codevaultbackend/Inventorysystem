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
  quotationId?: number | null;
  quotation_id?: number | null;
  invoiceId?: number | null;
  invoice_id?: number | null;
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

type ActionType = "view" | "download";

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

function getInvoiceActionId(entry: ClientLedgerEntry) {
  const quotationId = Number(entry.quotationId ?? entry.quotation_id ?? 0);
  const invoiceId = Number(entry.invoiceId ?? entry.invoice_id ?? 0);
  const entryId = Number(entry.entryId ?? 0);

  if (quotationId > 0) return quotationId;
  if (invoiceId > 0) return invoiceId;
  if (entryId > 0) return entryId;

  return null;
}

export default function CompanyLedgerEntriesPage() {
  const params = useParams();
  const companyId = String(params?.companyId || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState<LedgerClientDetails | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [busyAction, setBusyAction] = useState<{
    entryId: number;
    type: ActionType;
  } | null>(null);

  const baseUrl = getApiBaseUrl();

  useEffect(() => {
    if (!companyId) return;

    const fetchClientLedger = async () => {
      try {
        setLoading(true);
        setError("");
        setNotFoundState(false);

        const token = getStoredToken();

        const endpoints = [
          `${baseUrl}/sales/get-ladger/${companyId}`,
          `${baseUrl}/sales/get-ledger/${companyId}`,
        ];

        let responseData: ClientLedgerResponse | null = null;
        let lastError: any = null;

        for (const endpoint of endpoints) {
          try {
            const res = await axios.get<ClientLedgerResponse>(endpoint, {
              headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : undefined,
              withCredentials: true,
            });

            responseData = res.data;
            break;
          } catch (err: any) {
            lastError = err;
            const status = err?.response?.status;

            if (status === 404) continue;
            throw err;
          }
        }

        if (!responseData) {
          if (lastError?.response?.status === 404) {
            setNotFoundState(true);
            return;
          }

          throw lastError || new Error("Failed to load client ledger.");
        }

        const ledgerEntries = responseData?.ledger || [];
        const firstEntry = ledgerEntries[0];

        setCompany({
          id: Number(companyId),
          companyName: firstEntry?.client || `Client ${companyId}`,
          totalEntries: Number(responseData?.totalEntries || ledgerEntries.length || 0),
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

    fetchClientLedger();
  }, [companyId, baseUrl]);

  const pageTitle = useMemo(() => {
    if (!company) return "Ledger Entries";
    return `${company.companyName} Ledger Entries`;
  }, [company]);

  const handleInvoiceAction = async (
    entry: ClientLedgerEntry,
    type: ActionType
  ) => {
    try {
      setActionMessage("");

      const actionId = getInvoiceActionId(entry);

      if (!actionId) {
        setActionMessage("No invoice found.");
        return;
      }

      const token = getStoredToken();

      setBusyAction({
        entryId: Number(entry.entryId),
        type,
      });

      const response = await axios.post(
        `${baseUrl}/gt/${actionId}/convert-invoice`,
        {},
        {
          responseType: "blob",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
          validateStatus: () => true,
          withCredentials: true,
        }
      );

      const contentType = response.headers["content-type"] || "";
      const isPdf = contentType.includes("application/pdf");

      if (!isPdf) {
        let parsed: any = null;

        try {
          const text = await response.data.text();
          parsed = text ? JSON.parse(text) : null;
        } catch {
          parsed = null;
        }

        const message =
          parsed?.error ||
          parsed?.message ||
          (response.status === 404
            ? "No invoice found."
            : "Invoice PDF is not available.");

        setActionMessage(message);
        return;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      const fileName = `${entry.transactionId || `invoice-${entry.entryId}`}.pdf`;

      if (type === "view") {
        const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");

        if (!opened) {
          setActionMessage("Popup blocked. Please allow popups to view invoice.");
        }

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 60000);

        return;
      }

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 2000);
    } catch (err: any) {
      console.error("Invoice action error:", err);
      setActionMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch invoice."
      );
    } finally {
      setBusyAction(null);
    }
  };

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

        {actionMessage ? (
          <div className="mb-4 rounded-[10px] border border-[#FCD34D] bg-[#FFF7ED] px-4 py-3 text-[13px] font-medium text-[#B45309]">
            {actionMessage}
          </div>
        ) : null}

        <LedgerEntriesTable
          company={company}
          onViewInvoice={(entry) => handleInvoiceAction(entry, "view")}
          onDownloadInvoice={(entry) => handleInvoiceAction(entry, "download")}
          busyAction={busyAction}
        />
      </div>
    </div>
  );
}