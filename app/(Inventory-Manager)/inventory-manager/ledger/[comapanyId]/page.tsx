"use client";

import axios from "axios";
import { Download, Eye, Search, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useInvoicePdf } from "../../../../hooks/useInvoicePdf";

type LedgerApiRow = {
  entryId: number;
  type: string;
  transactionId: string;
  client: string;
  branchId: number;
  dateTime: string;
  amount: number;
  receivedAmount: number;
  pendingAmount: number;
  remark: string;
  invoiceFile: string | null;
  items: any[];
};

type LedgerResponse = {
  success: boolean;
  totalEntries: number;
  totalSales: number;
  totalReceived: number;
  pendingAmount: number;
  ledger: LedgerApiRow[];
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

function clearStoredTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("ims_token");
  localStorage.removeItem("imsToken");
  localStorage.removeItem("jwt");
}

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatMoney(value: unknown) {
  return `₹${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function splitDateTime(value?: string) {
  if (!value) return { date: "-", time: "" };

  const parts = value.split(",");
  return {
    date: parts[0]?.trim() || "-",
    time: parts.slice(1).join(",").trim() || "",
  };
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-b border-[#E9EEF5] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="h-7 w-[220px] animate-pulse rounded-md bg-[#EEF2F7] sm:w-[320px]" />
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="h-11 w-full animate-pulse rounded-[12px] bg-[#EEF2F7] sm:w-[300px]" />
        <div className="h-11 w-full animate-pulse rounded-[12px] bg-[#EEF2F7] sm:w-[122px]" />
        <div className="h-11 w-full animate-pulse rounded-[12px] bg-[#EEF2F7] sm:w-[122px]" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[1180px] border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F3F4F6]">
            {Array.from({ length: 10 }).map((_, index) => (
              <th key={index} className="px-4 py-4 text-left">
                <div className="h-4 w-20 animate-pulse rounded bg-[#E5E7EB]" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 10 }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="border-b border-[#EEF2F6] px-4 py-[17px]"
                >
                  <div className="h-4 w-24 animate-pulse rounded bg-[#EEF2F7]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompanyLedger() {
  const params = useParams();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const companyId = String(
    params?.companyId ||
      params?.comapanyId ||
      params?.id ||
      params?.clientId ||
      "7"
  );

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-backend-nm9g.onrender.com";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);

  const {
    loading: invoiceLoading,
    activeInvoiceNo,
    openPdf,
    downloadPdf,
  } = useInvoicePdf();

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();

        const res = await axios.get<LedgerResponse>(
          `${API_BASE}/sales/get-ladger/${companyId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!res.data?.success) {
          throw new Error("Invalid ledger response");
        }

        setLedgerData(res.data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load company ledger";

        setError(message);

        if (err?.response?.status === 401) {
          clearStoredTokens();
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchLedger();
  }, [API_BASE, companyId]);

  const rows = useMemo(() => {
    return ledgerData?.ledger || [];
  }, [ledgerData]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) =>
      [
        row.entryId,
        row.type,
        row.transactionId,
        row.client,
        row.branchId,
        row.dateTime,
        row.amount,
        row.receivedAmount,
        row.pendingAmount,
        row.remark,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  const handleExportCsv = () => {
    const headers = [
      "Deal ID",
      "Contact",
      "PO Number",
      "GST Number",
      "TXN ID",
      "Total Budget",
      "Total Spent",
      "Remaining",
      "Date & Time",
      "Remark",
    ];

    const csvRows = filteredRows.map((row) => [
      `LE${row.entryId}`,
      row.client,
      "-",
      "-",
      row.transactionId,
      row.amount,
      row.receivedAmount,
      row.pendingAmount,
      row.dateTime,
      row.remark,
    ]);

    const csv = [headers, ...csvRows]
      .map((item) => item.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `ledger-${companyId}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-[22px] border border-[#E6EBF2] bg-white shadow-[0_2px_14px_rgba(16,24,40,0.04)]">
        {loading ? (
          <>
            <HeaderSkeleton />
            <TableSkeleton />
          </>
        ) : error ? (
          <div className="flex min-h-[360px] items-center justify-center px-4 text-center">
            <div>
              <p className="text-[16px] font-[700] text-[#D92D20]">
                Failed to load company ledger
              </p>
              <p className="mt-2 text-[14px] text-[#667085]">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-4 py-[22px] sm:px-5 xl:flex-row xl:items-center xl:justify-between xl:px-6">
              <div className="min-w-0">
                <h1 className="truncate text-[16px] font-[700] leading-[24px] text-[#111827]">
                  Company Name :
                  <span className="ml-2 text-[12px] font-[600] text-[#1F2937]">
                    {filteredRows[0]?.client || rows[0]?.client || "-"}
                  </span>
                </h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap">
                <div className="relative h-[40px] w-full sm:w-[285px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search by item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-full w-full rounded-[10px] border border-transparent bg-[#F7F7F8] pl-11 pr-4 text-[13px] font-[400] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-5 text-[13px] font-[600] text-[#374151] shadow-sm transition hover:bg-[#F9FAFB]"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div className="flex min-h-[260px] items-center justify-center px-4 text-center">
                <div>
                  <p className="text-[15px] font-[600] text-[#2B3445]">
                    No data found
                  </p>
                  <p className="mt-1 text-[13px] text-[#7B8798]">
                    Try another search keyword.
                  </p>
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="ledger-scroll max-h-[560px] cursor-grab overflow-auto active:cursor-grabbing"
              >
                <table className="w-full min-w-[1180px] border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#F3F3F3]">
                      {[
                        "Deal ID",
                        "Contact",
                        "PO Number",
                        "GST Number",
                        "TXN ID",
                        "Total Budget",
                        "Total Spent",
                        "Remaining",
                        "Date & Time",
                        "Action",
                      ].map((head) => (
                        <th
                          key={head}
                          className="h-[39px] whitespace-nowrap px-4 text-left text-[12px] font-[700] leading-none text-[#111827]"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map((row) => {
                      const { date, time } = splitDateTime(row.dateTime);
                      const isActive = activeInvoiceNo === row.transactionId;

                      return (
                        <tr
                          key={row.entryId}
                          className="bg-white transition hover:bg-[#FAFBFC]"
                        >
                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[700] text-[#111827]">
                            LE{row.entryId}
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[600] text-[#111827]">
                            {row.client || "-"}
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[600] text-[#111827]">
                            -
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[600] text-[#111827]">
                            -
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[600] text-[#111827]">
                            {row.transactionId}
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[700] text-[#111827]">
                            {formatMoney(row.amount)}
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[700] text-[#111827]">
                            {formatMoney(row.receivedAmount)}
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[700] text-[#111827]">
                            {formatMoney(row.pendingAmount)}
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[600] text-[#111827]">
                            {date}
                            {time ? (
                              <span className="ml-2 text-[11px] font-[500] text-[#4B5563]">
                                {time}
                              </span>
                            ) : null}
                          </td>

                          <td className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={invoiceLoading && isActive}
                                onClick={() => openPdf(row.transactionId)}
                                className="inline-flex items-center gap-1 text-[12px] font-[600] text-[#2563EB] transition hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {invoiceLoading && isActive ? "Opening..." : "View"}
                              </button>

                              <button
                                type="button"
                                disabled={invoiceLoading && isActive}
                                onClick={() => downloadPdf(row.transactionId)}
                                className="inline-flex items-center gap-1 text-[12px] font-[600] text-[#2563EB] transition hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .ledger-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .ledger-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .ledger-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .ledger-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .ledger-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
}