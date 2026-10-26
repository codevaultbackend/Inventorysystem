"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchQuotationPdfBlob } from "../lib/quotationPdf";

type QuotationPdfContextType = {
  loading: boolean;
  activeQuotationId: string | number | null;
  error: string;
  openQuotationPdf: (quotationId: string | number) => Promise<void>;
  downloadQuotationPdf: (
    quotationId: string | number,
    fileName?: string
  ) => Promise<void>;
  clearQuotationPdfError: () => void;
};

const QuotationPdfContext = createContext<QuotationPdfContextType | null>(null);

function createFileName(
  quotationId: string | number,
  fileName?: string
): string {
  if (fileName && fileName.trim()) {
    return fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  }

  return `quotation-${quotationId}.pdf`;
}

export function QuotationPdfProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [activeQuotationId, setActiveQuotationId] = useState<
    string | number | null
  >(null);
  const [error, setError] = useState("");

  const clearQuotationPdfError = useCallback(() => {
    setError("");
  }, []);

  const openQuotationPdf = useCallback(async (quotationId: string | number) => {
    try {
      setLoading(true);
      setActiveQuotationId(quotationId);
      setError("");

      const blob = await fetchQuotationPdfBlob(quotationId, { type: "view" });
      const blobUrl = window.URL.createObjectURL(blob);

      window.open(blobUrl, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60_000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to open quotation PDF";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
      setActiveQuotationId(null);
    }
  }, []);

  const downloadQuotationPdf = useCallback(
    async (quotationId: string | number, fileName?: string) => {
      try {
        setLoading(true);
        setActiveQuotationId(quotationId);
        setError("");

        const blob = await fetchQuotationPdfBlob(quotationId, {
          type: "download",
        });

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = createFileName(quotationId, fileName);

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 60_000);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to download quotation PDF";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
        setActiveQuotationId(null);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      loading,
      activeQuotationId,
      error,
      openQuotationPdf,
      downloadQuotationPdf,
      clearQuotationPdfError,
    }),
    [
      loading,
      activeQuotationId,
      error,
      openQuotationPdf,
      downloadQuotationPdf,
      clearQuotationPdfError,
    ]
  );

  return (
    <QuotationPdfContext.Provider value={value}>
      {children}
    </QuotationPdfContext.Provider>
  );
}

export function useQuotationPdf() {
  const context = useContext(QuotationPdfContext);

  if (!context) {
    throw new Error(
      "useQuotationPdf must be used inside QuotationPdfProvider"
    );
  }

  return context;
}