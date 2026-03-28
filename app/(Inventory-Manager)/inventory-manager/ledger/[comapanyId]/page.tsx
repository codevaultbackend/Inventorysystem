"use client";

import axios from "axios";
import {
  Download,
  Eye,
  Search,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type ClientRow = {
  id?: number | string;
  clientCode?: string;
  vendorName?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  totalAmount?: number | string;
  pendingAmount?: number | string;
};

type DashboardResponse = {
  clients?: ClientRow[];
};

type DetailRow = {
  id: string;
  dealId: string;
  contact: string;
  poNumber: string;
  gstNumber: string;
  txnId: string;
  totalBudget: string;
  totalSpent: string;
  remaining: string;
  date: string;
  time: string;
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
  return `$${toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildRows(client: ClientRow | null): DetailRow[] {
  const totalAmount = formatMoney(client?.totalAmount || 0);
  const pendingAmount = formatMoney(client?.pendingAmount || 0);
  const phone = client?.phone || "99999-99999";
  const gst = client?.gstNumber || "GST-GT-9921";

  return Array.from({ length: 8 }).map((_, index) => ({
    id: `ledger-row-${index + 1}`,
    dealId: `LE${666423 + index}`,
    contact: phone,
    poNumber: `PO-2024-00${(index % 3) + 1}`,
    gstNumber: gst,
    txnId: `TXN-${88219 + index}`,
    totalBudget: totalAmount,
    totalSpent: totalAmount,
    remaining: pendingAmount,
    date: "2026-03-09",
    time: "2:00pm",
  }));
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-b border-[#E9EEF5] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="h-7 w-[220px] animate-pulse rounded-md bg-[#EEF2F7] sm:h-8 sm:w-[320px]" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="h-11 w-full animate-pulse rounded-[12px] bg-[#EEF2F7] sm:w-[260px] lg:w-[300px]" />
        <div className="h-11 w-full animate-pulse rounded-[12px] bg-[#EEF2F7] sm:w-[122px]" />
        <div className="h-11 w-full animate-pulse rounded-[12px] bg-[#EEF2F7] sm:w-[122px]" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1120px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#F7F9FC]">
              {Array.from({ length: 10 }).map((_, index) => (
                <th
                  key={index}
                  className="px-4 py-4 text-left first:rounded-tl-[14px] last:rounded-tr-[14px]"
                >
                  <div className="h-4 w-20 animate-pulse rounded bg-[#E9EEF5]" />
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
                    className="border-b border-[#EEF2F6] px-4 py-5"
                  >
                    <div className="h-4 w-24 animate-pulse rounded bg-[#EEF2F7]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[18px] border border-[#E9EEF5] bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="h-5 w-24 animate-pulse rounded bg-[#EEF2F7]" />
              <div className="h-5 w-12 animate-pulse rounded bg-[#EEF2F7]" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((__, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-[#EEF2F7]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-4 text-center">
      <div>
        <p className="text-[15px] font-[600] text-[#2B3445]">No data found</p>
        <p className="mt-1 text-[13px] text-[#7B8798]">
          Try another search keyword.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center px-4 text-center">
      <div>
        <p className="text-[16px] font-[700] text-[#D92D20]">
          Failed to load company ledger
        </p>
        <p className="mt-2 text-[14px] text-[#667085]">{message}</p>
      </div>
    </div>
  );
}

export default function CompanyLedger() {
  const params = useParams();

  // fixed param typo fallback support
  const companyId = String(
    params?.companyId || params?.comapanyId || ""
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [client, setClient] = useState<ClientRow | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-swp9.onrender.com";

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();

        if (!token) {
          throw new Error("No token found");
        }

        const res = await axios.get(`${API_BASE}/combine/dashboard/complete`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Invalid API response");
        }

        const dashboard: DashboardResponse = res.data.dashboard || {};
        const clients = dashboard.clients || [];

        const selectedClient =
          clients.find((item) => String(item.id) === companyId) || null;

        if (!selectedClient) {
          throw new Error("Company details not found");
        }

        setClient(selectedClient);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        setError(message);

        if (err?.response?.status === 401) {
          clearStoredTokens();
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    } else {
      setLoading(false);
      setError("Invalid company id");
    }
  }, [API_BASE, companyId]);

  const rows = useMemo(() => buildRows(client), [client]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) =>
      [
        row.dealId,
        row.contact,
        row.poNumber,
        row.gstNumber,
        row.txnId,
        row.totalBudget,
        row.totalSpent,
        row.remaining,
        row.date,
        row.time,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-[22px] border border-[#E6EBF2] bg-white shadow-[0_2px_14px_rgba(16,24,40,0.04)]">
        {loading ? (
          <>
            <HeaderSkeleton />
            <TableSkeleton />
          </>
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-[#E9EEF5] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="min-w-0">
                <h1 className="truncate text-[16px] font-[700] leading-[26px] tracking-[-0.01em] text-[#182230] sm:text-[16px]">
                  <span className="font-[500] !text-[16px] text-[#101828]">
                    Company Name :
                  </span>
                  <span className="ml-2 font-[600] !text-[12px] text-[#344054]">
                    {client?.vendorName || "-"}
                  </span>
                </h1>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap">
                <div className="relative w-full sm:min-w-[260px] sm:flex-1 lg:w-[300px] lg:flex-none">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="text"
                    placeholder="Search by item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-[44px] w-full rounded-[12px] border border-transparent bg-[#F8FAFC] pl-11 pr-4 text-[14px] font-[500] text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#D0D5DD] focus:bg-white"
                  />
                </div>

              </div>
            </div>

            {filteredRows.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1120px] border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[#667085]">
                        <th className="px-4 py-4 text-left text-[13px] font-[600] first:rounded-tl-[14px]">
                          Deal ID
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          Contact
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          PO Number
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          GST Number
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          TXN ID
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          Total Budget
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          Total Spent
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          Remaining
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600]">
                          Date &amp; Time
                        </th>
                        <th className="px-4 py-4 text-left text-[13px] font-[600] last:rounded-tr-[14px]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRows.map((row, index) => (
                        <tr
                          key={`${row.id}-${index}`}
                          className="group transition hover:bg-[#FAFBFC]"
                        >
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] font-[600] text-[#344054]">
                            {row.dealId}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] text-[#344054]">
                            {row.contact}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] text-[#344054]">
                            {row.poNumber}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] text-[#344054]">
                            {row.gstNumber}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] text-[#344054]">
                            {row.txnId}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] font-[600] text-[#344054]">
                            {row.totalBudget}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] font-[600] text-[#344054]">
                            {row.totalSpent}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] font-[600] text-[#344054]">
                            {row.remaining}
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px] text-[14px] text-[#344054]">
                            <span>{row.date}</span>
                            <span className="ml-2 text-[13px] text-[#667085]">
                              {row.time}
                            </span>
                          </td>
                          <td className="border-b border-[#EEF2F6] px-4 py-[18px]">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-[8px] text-[14px] font-[600] text-[#2563EB] transition hover:text-[#1D4ED8]"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
                  {filteredRows.map((row, index) => (
                    <div
                      key={`${row.id}-mobile-${index}`}
                      className="rounded-[18px] border border-[#E9EEF5] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-[700] text-[#182230]">
                            {row.dealId}
                          </p>
                          <p className="mt-1 text-[13px] text-[#667085]">
                            {row.date} <span className="mx-1">•</span> {row.time}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-[8px] text-[13px] font-[600] text-[#2563EB]"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                        <div>
                          <p className="text-[12px] font-[600] text-[#98A2B3]">
                            Contact
                          </p>
                          <p className="mt-1 text-[13px] font-[500] text-[#344054]">
                            {row.contact}
                          </p>
                        </div>

                        <div>
                          <p className="text-[12px] font-[600] text-[#98A2B3]">
                            PO Number
                          </p>
                          <p className="mt-1 text-[13px] font-[500] text-[#344054]">
                            {row.poNumber}
                          </p>
                        </div>

                        <div>
                          <p className="text-[12px] font-[600] text-[#98A2B3]">
                            GST Number
                          </p>
                          <p className="mt-1 text-[13px] font-[500] text-[#344054] break-words">
                            {row.gstNumber}
                          </p>
                        </div>

                        <div>
                          <p className="text-[12px] font-[600] text-[#98A2B3]">
                            TXN ID
                          </p>
                          <p className="mt-1 text-[13px] font-[500] text-[#344054]">
                            {row.txnId}
                          </p>
                        </div>

                        <div>
                          <p className="text-[12px] font-[600] text-[#98A2B3]">
                            Total Budget
                          </p>
                          <p className="mt-1 text-[13px] font-[700] text-[#344054]">
                            {row.totalBudget}
                          </p>
                        </div>

                        <div>
                          <p className="text-[12px] font-[600] text-[#98A2B3]">
                            Total Spent
                          </p>
                          <p className="mt-1 text-[13px] font-[700] text-[#344054]">
                            {row.totalSpent}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-[12px] font-[600] text-[#98A2B3]">
                            Remaining
                          </p>
                          <p className="mt-1 text-[13px] font-[700] text-[#344054]">
                            {row.remaining}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}