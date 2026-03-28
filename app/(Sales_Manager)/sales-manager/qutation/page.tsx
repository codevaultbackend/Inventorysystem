"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import QuotationCard from "./component/QuotationCard";
import QuotationModal from "./component/QuotationModal";
import StatsSection from "./component/StatsSection";
import { useRouter } from "next/navigation";

export type QuotationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "invoiced";

export interface QuotationItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  cgst: number;
  sgst: number;
  amount: number;
}

export interface QuotationClient {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface QuotationBranch {
  id: number;
  name: string;
  location: string;
}

export interface Quotation {
  id: number;
  quotation_no: string;
  client_id: number;
  branch_id: number;
  total_amount: number;
  gst_amount: number;
  valid_till: string | null;
  status: QuotationStatus;
  createdAt: string;
  client: QuotationClient | null;
  branch: QuotationBranch | null;
  items: QuotationItem[];
}

interface BranchGroupedQuotation {
  branchId?: number;
  branchName?: string;
  branchLocation?: string;
  quotations?: any[];
}

interface QuotationApiResponse {
  success?: boolean;
  total?: number;
  quotations?: any[];
  branches?: BranchGroupedQuotation[];
  data?: {
    total?: number;
    quotations?: any[];
    rows?: any[];
    branches?: BranchGroupedQuotation[];
  };
  rows?: any[];
  message?: string;
  error?: string;
}

type SortType =
  | "latest"
  | "oldest"
  | "amount_high_to_low"
  | "amount_low_to_high";

function getStoredToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt")
  );
}

function getStoredUserRole(): string {
  if (typeof window === "undefined") return "";

  try {
    const authRaw =
      localStorage.getItem("auth") ||
      localStorage.getItem("user") ||
      localStorage.getItem("authUser");

    if (authRaw) {
      const parsed = JSON.parse(authRaw);

      if (parsed?.role) return String(parsed.role).toLowerCase();
      if (parsed?.user?.role) return String(parsed.user.role).toLowerCase();
    }
  } catch {}

  return "";
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-swp9.onrender.com"
  ).replace(/\/+$/, "");
}

function normalizeQuotation(raw: any): Quotation {
  return {
    id: Number(raw?.id || 0),
    quotation_no: String(raw?.quotation_no || raw?.quotationNo || "-"),
    client_id: Number(raw?.client_id || raw?.clientId || 0),
    branch_id: Number(raw?.branch_id || raw?.branchId || 0),
    total_amount: Number(raw?.total_amount || raw?.totalAmount || 0),
    gst_amount: Number(raw?.gst_amount || raw?.gstAmount || 0),
    valid_till: raw?.valid_till || raw?.validTill || null,
    status: String(raw?.status || "pending").toLowerCase() as QuotationStatus,
    createdAt: String(
      raw?.createdAt || raw?.created_at || new Date().toISOString()
    ),
    client: raw?.client
      ? {
          id: Number(raw.client?.id || 0),
          name: raw.client?.name ?? null,
          phone: raw.client?.phone ?? null,
          email: raw.client?.email ?? null,
        }
      : null,
    branch: raw?.branch
      ? {
          id: Number(raw.branch?.id || raw?.branch_id || raw?.branchId || 0),
          name: String(raw.branch?.name || raw?.branchName || ""),
          location: String(
            raw.branch?.location || raw?.branchLocation || ""
          ),
        }
      : raw?.branchName || raw?.branchLocation || raw?.branch_id || raw?.branchId
      ? {
          id: Number(raw?.branch_id || raw?.branchId || 0),
          name: String(raw?.branchName || ""),
          location: String(raw?.branchLocation || ""),
        }
      : null,
    items: Array.isArray(raw?.items)
      ? raw.items.map((item: any) => ({
          id: Number(item?.id || 0),
          product_name: String(item?.product_name || item?.productName || ""),
          quantity: Number(item?.quantity || 0),
          unit_price: Number(item?.unit_price || item?.unitPrice || 0),
          cgst: Number(item?.cgst || 0),
          sgst: Number(item?.sgst || 0),
          amount: Number(item?.amount || 0),
        }))
      : [],
  };
}

function extractFromBranches(branches: BranchGroupedQuotation[] = []) {
  if (!Array.isArray(branches)) return [];

  return branches.flatMap((branch) => {
    const branchQuotations = Array.isArray(branch?.quotations)
      ? branch.quotations
      : [];

    return branchQuotations.map((quote: any) => {
      const hasBranchObject = !!quote?.branch;

      if (hasBranchObject) return quote;

      return {
        ...quote,
        branch: {
          id: Number(quote?.branch_id || quote?.branchId || branch?.branchId || 0),
          name: String(
            quote?.branch?.name || branch?.branchName || ""
          ),
          location: String(
            quote?.branch?.location || branch?.branchLocation || ""
          ),
        },
      };
    });
  });
}

function extractQuotationPayload(resData: QuotationApiResponse) {
  const directRows =
    resData?.quotations ||
    resData?.data?.quotations ||
    resData?.rows ||
    resData?.data?.rows ||
    [];

  const branchRows =
    extractFromBranches(resData?.branches || []) ||
    extractFromBranches(resData?.data?.branches || []);

  const mergedRows = Array.isArray(directRows) && directRows.length
    ? directRows
    : branchRows;

  const normalized = Array.isArray(mergedRows)
    ? mergedRows.map(normalizeQuotation)
    : [];

  const uniqueMap = new Map<number, Quotation>();

  normalized.forEach((quote) => {
    if (!uniqueMap.has(quote.id)) {
      uniqueMap.set(quote.id, quote);
    }
  });

  const quotations = Array.from(uniqueMap.values());

  const total =
    Number(resData?.total) ||
    Number(resData?.data?.total) ||
    quotations.length;

  return { quotations, total };
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("latest");
  const [userRole, setUserRole] = useState("");

  const baseUrl = getBaseUrl();
  const router = useRouter();

  const canApprove = useMemo(() => {
    const role = userRole.toLowerCase();
    return (
      role === "sales_manager" ||
      role === "super_admin" ||
      role === "super_sales_manager"
    );
  }, [userRole]);

  const fetchQuotations = useCallback(async () => {
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
        `${baseUrl}/sales/get`,
        `${baseUrl}/sales/quotation/get`,
        `${baseUrl}/sales/quotations`,
      ];

      let responseData: QuotationApiResponse | null = null;
      let lastError: any = null;

      for (const endpoint of endpoints) {
        try {
          const res = await axios.get<QuotationApiResponse>(endpoint, {
            headers,
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
        throw lastError || new Error("Failed to load quotations");
      }

      const payload = extractQuotationPayload(responseData);

      setQuotations(payload.quotations);
      setTotal(payload.total);
    } catch (err: any) {
      console.error("Quotation fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load quotations"
      );
      setQuotations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    setUserRole(getStoredUserRole());
    fetchQuotations();
  }, [fetchQuotations]);

  const handleApproveQuotation = async (quoteId: number) => {
    try {
      setApproveLoading(true);

      const token = getStoredToken();

      const endpoints = [
        `${baseUrl}/sales/approve/${quoteId}`,
        `${baseUrl}/sales/quotation/approve/${quoteId}`,
        `${baseUrl}/sales/quotations/approve/${quoteId}`,
      ];

      let updatedQuotation: Quotation | null = null;
      let lastError: any = null;

      for (const endpoint of endpoints) {
        try {
          const res = await axios.put(
            endpoint,
            {},
            {
              headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : undefined,
              withCredentials: true,
            }
          );

          const updatedQuotationRaw =
            res?.data?.quotation ||
            res?.data?.data?.quotation ||
            res?.data?.updatedQuotation ||
            res?.data?.data?.updatedQuotation ||
            null;

          updatedQuotation = updatedQuotationRaw
            ? normalizeQuotation(updatedQuotationRaw)
            : null;

          break;
        } catch (err: any) {
          lastError = err;
          if (err?.response?.status === 404) continue;
          throw err;
        }
      }

      if (!updatedQuotation && lastError) {
        throw lastError;
      }

      setQuotations((prev) =>
        prev.map((quote) =>
          quote.id === quoteId
            ? {
                ...quote,
                ...(updatedQuotation || {}),
                status: "approved",
              }
            : quote
        )
      );

      setSelectedQuote((prev) =>
        prev && prev.id === quoteId
          ? {
              ...prev,
              ...(updatedQuotation || {}),
              status: "approved",
            }
          : prev
      );
    } catch (err: any) {
      console.error("Approve quotation error:", err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to approve quotation"
      );
    } finally {
      setApproveLoading(false);
    }
  };

  const filteredAndSortedQuotations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = quotations.filter((quote) => {
      if (!normalizedSearch) return true;

      const clientName = quote.client?.name?.toLowerCase() || "";
      const clientEmail = quote.client?.email?.toLowerCase() || "";
      const clientPhone = quote.client?.phone?.toLowerCase() || "";
      const quotationNo = quote.quotation_no?.toLowerCase() || "";
      const branchName = quote.branch?.name?.toLowerCase() || "";
      const status = quote.status?.toLowerCase() || "";

      return (
        quotationNo.includes(normalizedSearch) ||
        clientName.includes(normalizedSearch) ||
        clientEmail.includes(normalizedSearch) ||
        clientPhone.includes(normalizedSearch) ||
        branchName.includes(normalizedSearch) ||
        status.includes(normalizedSearch)
      );
    });

    const sorted = [...filtered];

    switch (sortBy) {
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "amount_high_to_low":
        sorted.sort((a, b) => b.total_amount - a.total_amount);
        break;
      case "amount_low_to_high":
        sorted.sort((a, b) => a.total_amount - b.total_amount);
        break;
      case "latest":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return sorted;
  }, [quotations, search, sortBy]);

  const stats = useMemo(() => {
    const pending = quotations.filter((q) => q.status === "pending");
    const approved = quotations.filter((q) => q.status === "approved");
    const rejected = quotations.filter((q) => q.status === "rejected");

    const totalAmount = quotations.reduce(
      (sum, q) => sum + Number(q.total_amount || 0),
      0
    );

    const pendingAmount = pending.reduce(
      (sum, q) => sum + Number(q.total_amount || 0),
      0
    );

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const pendingThisWeek = pending.filter(
      (q) => new Date(q.createdAt).getTime() >= oneWeekAgo
    ).length;

    return {
      totalQuotations: total || quotations.length,
      totalAmount,
      pendingCount: pending.length,
      pendingAmount,
      pendingThisWeek,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
    };
  }, [quotations, total]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] ">
        <div className="mx-auto max-w-[1280px] animate-pulse space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-[96px] rounded-[16px] bg-white" />
            <div className="h-[96px] rounded-[16px] bg-white" />
            <div className="h-[96px] rounded-[16px] bg-white" />
            <div className="h-[96px] rounded-[16px] bg-white" />
          </div>

          <div className="rounded-[20px] bg-white p-4 sm:p-6">
            <div className="mb-6 h-[40px] w-[240px] rounded bg-[#F3F4F6]" />
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <div className="h-[42px] flex-1 rounded bg-[#F3F4F6]" />
              <div className="h-[42px] w-[180px] rounded bg-[#F3F4F6]" />
            </div>
            <div className="space-y-3">
              <div className="h-[92px] rounded-[14px] bg-[#F9FAFB]" />
              <div className="h-[92px] rounded-[14px] bg-[#F9FAFB]" />
              <div className="h-[92px] rounded-[14px] bg-[#F9FAFB]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] ">
        <div className="mx-auto flex min-h-[400px] max-w-[1280px] items-center justify-center rounded-[20px] bg-white p-8 text-center shadow-sm">
          <div>
            <h2 className="text-[24px] font-semibold text-[#111827]">
              Failed to load quotations
            </h2>
            <p className="mt-3 text-[14px] text-[#6B7280]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] ">
      <div className="mx-auto max-w-[1280px]">
        <StatsSection stats={stats} />

        <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold text-[#111827] sm:text-[20px]">
                All Quotations Entries
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Showing {filteredAndSortedQuotations.length} of {total} quotations
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#111827] px-4 text-[13px] font-medium text-white transition hover:bg-[#1F2937] sm:w-auto"
              onClick={() => router.push("/sales-manager/client-intake")}
            >
              <Plus size={16} />
              Create Quotation
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[340px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, Client Name, Email..."
                className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pl-10 pr-4 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#CBD5E1]"
              />
            </div>

            <div className="relative w-full lg:w-[220px]">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="h-[42px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white pl-10 pr-4 text-[13px] text-[#111827] outline-none focus:border-[#CBD5E1]"
              >
                <option value="latest">Sort by Latest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="amount_high_to_low">Amount High to Low</option>
                <option value="amount_low_to_high">Amount Low to High</option>
              </select>
            </div>
          </div>

          {filteredAndSortedQuotations.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] text-center">
              <div>
                <p className="text-[16px] font-semibold text-[#111827]">
                  No quotations found
                </p>
                <p className="mt-2 text-[13px] text-[#6B7280]">
                  Try changing your search or sorting filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAndSortedQuotations.map((q) => (
                <QuotationCard
                  key={q.id}
                  data={q}
                  onView={() => setSelectedQuote(q)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedQuote && (
          <QuotationModal
            quote={selectedQuote}
            onClose={() => setSelectedQuote(null)}
            onApprove={handleApproveQuotation}
            approveLoading={approveLoading}
            canApprove={canApprove}
          />
        )}
      </div>
    </div>
  );
}