"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BadgeCheck,
  CircleX,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  ListFilter,
  Search,
} from "lucide-react";

type InvoiceStats = {
  totalInvoice?: number | string;
  pendingInvoice?: number | string;
  todayInvoice?: number | string;
  rejectedInvoice?: number | string;
};

type RawInvoice = {
  id: number;
  branchId: number;
  invoiceNo: string;
  client: string | null;
  amount: number | string;
  status: string;
  date: string;
  quotationRef: string | null;
};

type GroupedInvoiceBranch = {
  branchId: number;
  totalInvoices: number;
  totalAmount: number;
  pending: number;
  invoiced: number;
  rejected: number;
  invoices: RawInvoice[];
};

type InvoiceApiResponse = {
  success: boolean;
  stats?: InvoiceStats;
  invoices?: RawInvoice[] | GroupedInvoiceBranch[];
};

type InvoiceItem = {
  id: number;
  branchId: number;
  invoiceNo: string;
  client: string;
  amount: number;
  status: string;
  date: string;
  quotationRef: string;
};

type SortMode = "default" | "date" | "amount";

function toNumber(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function formatMoney(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

function normalizeInvoices(
  invoices: InvoiceApiResponse["invoices"]
): InvoiceItem[] {
  if (!Array.isArray(invoices) || invoices.length === 0) return [];

  const first = invoices[0] as RawInvoice | GroupedInvoiceBranch;

  if ("invoices" in first && Array.isArray(first.invoices)) {
    return (invoices as GroupedInvoiceBranch[]).flatMap((branch) =>
      (branch.invoices || []).map((invoice) => ({
        id: toNumber(invoice.id),
        branchId: toNumber(invoice.branchId),
        invoiceNo: String(invoice.invoiceNo || "-"),
        client: String(invoice.client || "Company Name"),
        amount: toNumber(invoice.amount),
        status: String(invoice.status || "pending"),
        date: String(invoice.date || "-"),
        quotationRef: String(invoice.quotationRef || "-"),
      }))
    );
  }

  return (invoices as RawInvoice[]).map((invoice) => ({
    id: toNumber(invoice.id),
    branchId: toNumber(invoice.branchId),
    invoiceNo: String(invoice.invoiceNo || "-"),
    client: String(invoice.client || "Company Name"),
    amount: toNumber(invoice.amount),
    status: String(invoice.status || "pending"),
    date: String(invoice.date || "-"),
    quotationRef: String(invoice.quotationRef || "-"),
  }));
}

function statusPillClass(status: string) {
  const s = status.toLowerCase();

  if (s === "invoiced") {
    return "bg-[#E8F8EC] text-[#22A447]";
  }

  if (s === "rejected") {
    return "bg-[#FFF0F1] text-[#F04438]";
  }

  return "bg-[#FFF8E8] text-[#D48A00]";
}

function DashboardStatCard({
  topText,
  value,
  label,
  icon,
  circleBg,
  iconWrap,
}: {
  topText?: string;
  value: string | number;
  label: string;
  icon: React.ReactNode;
  circleBg: string;
  iconWrap: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[#EDF1F5] bg-white px-5 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div
        className={`absolute right-[-26px] top-[-28px] h-[110px] w-[110px] rounded-full ${circleBg}`}
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {topText ? (
            <p className="text-[14px] font-medium text-[#22B14C]">{topText}</p>
          ) : (
            <div className="h-[21px]" />
          )}

          <h3 className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.03em] text-[#1F2937]">
            {value}
          </h3>
          <p className="mt-2 text-[14px] font-medium text-[#6B7280]">{label}</p>
        </div>

        <div
          className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(15,23,42,0.08)] ${iconWrap}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function InvoiceRowCard({ invoice }: { invoice: InvoiceItem }) {
  return (
    <div className="rounded-[16px] border border-[#E8EDF3] bg-white px-4 py-4 transition hover:shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[19px] font-semibold text-[#111827]">
            Company Name
          </h3>

          <div className="mt-1 flex items-center gap-2 text-[13px] text-[#7B8794]">
            <FileSpreadsheet className="h-[14px] w-[14px]" />
            <span className="truncate">{invoice.client}</span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-[13px] font-medium text-[#49566A] sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center xl:gap-6">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-[14px] w-[14px] text-[#6B7280]" />
              <span className="text-[#5A6577]">
                INV Number :{" "}
                <span className="font-semibold text-[#6B7280]">
                  {invoice.invoiceNo}
                </span>
              </span>
            </div>

            <div>
              Quotation :{" "}
              <span className="font-semibold text-[#16A34A]">
                {invoice.quotationRef}
              </span>
            </div>

            <div>
              Date :{" "}
              <span className="font-semibold text-[#16A34A]">{invoice.date}</span>
            </div>

            <div>
              Total Amt :{" "}
              <span className="font-semibold text-[#16A34A]">
                {formatMoney(invoice.amount)}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span
              className={`inline-flex rounded-[6px] px-2.5 py-1 text-[12px] font-semibold capitalize ${statusPillClass(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button
            type="button"
            className="inline-flex h-[34px] items-center justify-center gap-1.5 rounded-[8px] bg-[#2457F5] px-3 text-[13px] font-medium text-white transition hover:bg-[#1D4ED8]"
            onClick={() => {
              console.log("View invoice", invoice.id);
            }}
          >
            <Eye className="h-[14px] w-[14px]" />
            View
          </button>

          <button
            type="button"
            className="inline-flex h-[34px] items-center justify-center gap-1.5 rounded-[8px] bg-[#4A5568] px-3 text-[13px] font-medium text-white transition hover:bg-[#374151]"
            onClick={() => {
              console.log("Download invoice", invoice.id);
            }}
          >
            <Download className="h-[14px] w-[14px]" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoice: 0,
    pendingInvoice: 0,
    todayInvoice: 0,
    rejectedInvoice: 0,
  });
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchInvoiceDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") ||
              localStorage.getItem("token") ||
              localStorage.getItem("authToken")
            : null;

        const res = await axios.get<InvoiceApiResponse>(
          `${baseUrl}/sales/get-invoice`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          }
        );

        setStats({
          totalInvoice: toNumber(res.data?.stats?.totalInvoice),
          pendingInvoice: toNumber(res.data?.stats?.pendingInvoice),
          todayInvoice: toNumber(res.data?.stats?.todayInvoice),
          rejectedInvoice: toNumber(res.data?.stats?.rejectedInvoice),
        });

        setInvoices(normalizeInvoices(res.data?.invoices));
      } catch (err: any) {
        console.error("Invoice dashboard fetch error:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load invoice dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) {
      fetchInvoiceDashboard();
    } else {
      setLoading(false);
      setError("API base URL is missing.");
    }
  }, [baseUrl]);

  const filteredInvoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let result = invoices.filter((invoice) => {
      if (!normalized) return true;

      return (
        invoice.client.toLowerCase().includes(normalized) ||
        invoice.invoiceNo.toLowerCase().includes(normalized) ||
        invoice.quotationRef.toLowerCase().includes(normalized) ||
        invoice.status.toLowerCase().includes(normalized) ||
        String(invoice.id).includes(normalized)
      );
    });

    if (sortMode === "amount") {
      result = [...result].sort((a, b) => b.amount - a.amount);
    }

    if (sortMode === "date") {
      result = [...result].sort((a, b) =>
        b.date.localeCompare(a.date, undefined, { numeric: true })
      );
    }

    return result;
  }, [invoices, query, sortMode]);

  const sortLabel =
    sortMode === "default"
      ? "Sort by Date / Amount"
      : sortMode === "date"
      ? "Sorted by Date"
      : "Sorted by Amount";

  const toggleSort = () => {
    setSortMode((prev) =>
      prev === "default" ? "date" : prev === "date" ? "amount" : "default"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] p-1 sm:p-1 lg:p-1">
        <div className="mx-auto max-w-[1380px] rounded-[28px] bg-[#F8FAFC] p-1 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-1 lg:p-1">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-[116px] rounded-[18px] bg-white" />
              <div className="h-[116px] rounded-[18px] bg-white" />
              <div className="h-[116px] rounded-[18px] bg-white" />
              <div className="h-[116px] rounded-[18px] bg-white" />
            </div>

            <div className="h-[92px] rounded-[16px] bg-[#F3E8FF]" />

            <div className="rounded-[18px] bg-white p-4">
              <div className="mb-4 h-7 w-40 rounded bg-[#EEF2F7]" />
              <div className="mb-4 flex gap-3">
                <div className="h-10 w-[260px] rounded-[10px] bg-[#EEF2F7]" />
                <div className="ml-auto h-10 w-[180px] rounded-[10px] bg-[#EEF2F7]" />
              </div>

              <div className="space-y-4">
                <div className="h-[118px] rounded-[16px] bg-[#F8FAFC]" />
                <div className="h-[118px] rounded-[16px] bg-[#F8FAFC]" />
                <div className="h-[118px] rounded-[16px] bg-[#F8FAFC]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F7FF66] p-1 px-[2] sm:p-1 lg:p-1">
        <div className="mx-auto flex min-h-[420px] max-w-[1380px] items-center justify-center rounded-[12px] bg-[#F2F7FF66] p-2 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-[24px] font-semibold text-[#111827]">
              Unable to load invoice dashboard
            </h2>
            <p className="mt-3 text-[14px] text-[#6B7280]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-3 max-[650px]:p-0 max-[650px]:pt-[20px] lg:p-1 ">
      <div className="mx-auto max-w-[1380px] rounded-[12px] bg-[#F2F7FF66] p-2 pl-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-2 lg-pl-6 max-[650px]:p-1 ">
        <div className="space-y-5">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              topText=""
              value={toNumber(stats.totalInvoice)}
              label="Total Invoice"
              icon={<ClipboardList className="h-[20px] w-[20px] text-[#6B7280]" />}
              circleBg="bg-[#F2F4F7]"
              iconWrap=""
            />

            <DashboardStatCard
              topText={`${toNumber(stats.pendingInvoice)} this week`}
              value={toNumber(stats.pendingInvoice)}
              label="Pending Invoice"
              icon={<Clock3 className="h-[20px] w-[20px] text-[#D48A00]" />}
              circleBg="bg-[#F6E9C9]"
              iconWrap=""
            />

            <DashboardStatCard
              topText=""
              value={toNumber(stats.todayInvoice)}
              label="Today Invoice"
              icon={<BadgeCheck className="h-[20px] w-[20px] text-[#22C55E]" />}
              circleBg="bg-[#DFF3E7]"
              iconWrap=""
            />

            <DashboardStatCard
              topText=""
              value={toNumber(stats.rejectedInvoice)}
              label="Rejected Invoice"
              icon={<CircleX className="h-[20px] w-[20px] text-[#F04438]" />}
              circleBg="bg-[#F8E2E4]"
              iconWrap=""
            />
          </section>

          <section className="rounded-[16px] border border-[#E9D5FF] bg-[#FAF5FF] px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#9333EA]">
                <FileSpreadsheet className="h-[18px] w-[18px]" />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[#6B21A8]">
                  Automated Invoice Generation
                </h3>
                <p className="mt-1 text-[13px] leading-6 text-[#8B5CF6] sm:text-[14px]">
                  Invoices are automatically generated when quotations are
                  approved. Each invoice is linked to the client, quotation, and
                  sales manager for complete traceability.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[18px] border border-[#E7ECF2] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="border-b border-[#EEF2F6] px-5 py-5">
              <h2 className="text-[17px] font-semibold text-[#111827]">
                All Invoice Entries
              </h2>
            </div>

            <div className="flex flex-col gap-3 border-b border-[#EEF2F6] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-[320px]">
                <Search className="pointer-events-none absolute left-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID or Client Name..."
                  className="h-[40px] w-full rounded-[10px] border border-[#E5E7EB] bg-[#FCFCFD] pl-[36px] pr-[12px] text-[13px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#D1D5DB]"
                />
              </div>

              <button
                type="button"
                onClick={toggleSort}
                className="inline-flex h-[40px] w-full items-center justify-center gap-[8px] rounded-[10px] border border-[#E5E7EB] bg-[#FCFCFD] px-[14px] text-[13px] font-medium text-[#6B7280] transition hover:bg-white sm:w-auto"
              >
                <ListFilter className="h-[14px] w-[14px] shrink-0" />
                <span className="truncate">{sortLabel}</span>
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {filteredInvoices.length > 0 ? (
                <div className="space-y-4">
                  {filteredInvoices.map((invoice) => (
                    <InvoiceRowCard key={invoice.id} invoice={invoice} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-[#D7DEE7] bg-[#FAFBFC] px-6 py-10 text-center">
                  <p className="text-[16px] font-medium text-[#111827]">
                    No invoice entries found.
                  </p>
                  <p className="mt-1 text-[14px] text-[#6B7280]">
                    Try searching with another client name or invoice number.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}