"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import QuotationCard from "./component/QuotationCard";
import QuotationModal from "./component/QuotationModal";
import StatsSection from "./component/StatsSection";
import { useRouter } from "next/navigation";

export type QuotationStatus = "pending" | "approved" | "rejected" | "invoiced";

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

interface QuotationApiResponse {
  total: number;
  quotations: Quotation[];
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
    localStorage.getItem("imsToken")
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

  const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
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

      const res = await axios.get<QuotationApiResponse>(`${BaseUrl}/sales/get`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      setQuotations(res.data?.quotations || []);
      setTotal(res.data?.total || 0);
    } catch (err: any) {
      console.error("Quotation fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load quotations"
      );
    } finally {
      setLoading(false);
    }
  }, [BaseUrl]);

  useEffect(() => {
    setUserRole(getStoredUserRole());
    fetchQuotations();
  }, [fetchQuotations]);

  const handleApproveQuotation = async (quoteId: number) => {
    try {
      setApproveLoading(true);

      const token = getStoredToken();

      const res = await axios.put(
        `${BaseUrl}/sales/approve/${quoteId}`,
        {},
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        }
      );

      const updatedQuotation: Quotation | undefined = res?.data?.quotation;

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
          "Failed to approve quotation"
      );
    } finally {
      setApproveLoading(false);
    }
  };

  const filteredAndSortedQuotations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = quotations.filter((quote) => {
      const clientName = quote.client?.name?.toLowerCase() || "";
      const clientEmail = quote.client?.email?.toLowerCase() || "";
      const clientPhone = quote.client?.phone?.toLowerCase() || "";
      const quotationNo = quote.quotation_no?.toLowerCase() || "";
      const branchName = quote.branch?.name?.toLowerCase() || "";

      return (
        quotationNo.includes(normalizedSearch) ||
        clientName.includes(normalizedSearch) ||
        clientEmail.includes(normalizedSearch) ||
        clientPhone.includes(normalizedSearch) ||
        branchName.includes(normalizedSearch)
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
    }

    return sorted;
  }, [quotations, search, sortBy]);

  const stats = useMemo(() => {
    const pending = quotations.filter((q) => q.status === "pending");
    const approved = quotations.filter((q) => q.status === "approved");
    const rejected = quotations.filter((q) => q.status === "rejected");

    const totalAmount = quotations.reduce((sum, q) => sum + q.total_amount, 0);
    const pendingAmount = pending.reduce((sum, q) => sum + q.total_amount, 0);

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const pendingThisWeek = pending.filter(
      (q) => new Date(q.createdAt).getTime() >= oneWeekAgo
    ).length;

    return {
      totalQuotations: total,
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
      <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 md:p-6">
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
      <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 md:p-6">
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
    <div className="min-h-screen bg-[#F6F8FB] p-3 sm:p-4 md:p-6">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
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