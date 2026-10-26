"use client";

import { useState } from "react";
import { getInvoicePdf } from "../lib/invoice";

export function useInvoicePdf() {
  const [loading, setLoading] = useState(false);
  const [activeInvoiceNo, setActiveInvoiceNo] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const openPdf = async (invoiceId: string) => {
    try {
      setLoading(true);
      setActiveInvoiceNo(invoiceId);
      setError("");

      const data = await getInvoicePdf(invoiceId);

      if (!data.download_url) {
        throw new Error("Download URL not found");
      }

      window.open(data.download_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to open invoice PDF";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
      setActiveInvoiceNo(null);
    }
  };

  const downloadPdf = async (invoiceId: string) => {
    try {
      setLoading(true);
      setActiveInvoiceNo(invoiceId);
      setError("");

      const data = await getInvoicePdf(invoiceId);

      if (!data.download_url) {
        throw new Error("Download URL not found");
      }

      const link = document.createElement("a");
      link.href = data.download_url;
      link.download = `${invoiceId}.pdf`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to download invoice PDF";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
      setActiveInvoiceNo(null);
    }
  };

  return {
    loading,
    activeInvoiceNo,
    error,
    openPdf,
    downloadPdf,
  };
}