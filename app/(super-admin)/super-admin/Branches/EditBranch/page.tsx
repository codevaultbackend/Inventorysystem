"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import { useSuperDashboard } from "@/app/context/SuperDashboardContext";
import { api } from "../../../../lib/api";

type BranchOverviewItem = {
  id?: number | string;
  branchName?: string;
  name?: string;
  code?: string;
  location?: string;
  type?: string;
  state?: string;
  status?: string;
  stockItems?: number | string;
  purchase?: number | string;
  sale?: number | string;
  sales?: number | string;
  stockIn?: number | string;
  stockOut?: number | string;
};

type DashboardData = {
  branchOverview?: BranchOverviewItem[];
};

type BackendBranchItem = {
  id?: number | string;
  name?: string;
  code?: string;
  location?: string;
  type?: string;
  state?: string;
  status?: string;
  contact_number?: string | null;
  email?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type BackendBranchesResponse = {
  message?: string;
  total?: number;
  branches?: BackendBranchItem[];
};

type PeriodKey = "Daily" | "Weekly" | "Monthly";

type CreatedUserCredential = {
  role: string;
  email: string;
  password: string;
};

type TableBranch = {
  name: string;
  id: string;
  code?: string;
  location?: string;
  type?: string;
  state?: string;
  status: string;
  hasCredentials: boolean;
  data: {
    Daily: {
      stock: number | string;
      purchase: string;
      sales: string;
      in: number | string;
      out: number | string;
    };
    Weekly: {
      stock: number | string;
      purchase: string;
      sales: string;
      in: number | string;
      out: number | string;
    };
    Monthly: {
      stock: number | string;
      purchase: string;
      sales: string;
      in: number | string;
      out: number | string;
    };
  };
};

type NewBranchForm = {
  name: string;
  code: string;
  location: string;
  type: "HEAD_OFFICE" | "WAREHOUSE" | "RETAIL" | "FRANCHISE" | "";
  state: string;
  status: "ACTIVE" | "INACTIVE";
};

const BRANCH_TYPE_OPTIONS = [
  { label: "Head Office", value: "HEAD_OFFICE" },
  { label: "Warehouse", value: "WAREHOUSE" },
  { label: "Retail", value: "RETAIL" },
  { label: "Franchise", value: "FRANCHISE" },
] as const;

function parseCompactNumber(value: number | string | undefined | null) {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const str = String(value)
    .trim()
    .toUpperCase()
    .replace(/₹/g, "")
    .replace(/,/g, "");

  if (str.endsWith("CR")) {
    const num = parseFloat(str.replace("CR", ""));
    return Number.isNaN(num) ? 0 : Math.round(num * 10000000);
  }

  if (str.endsWith("L")) {
    const num = parseFloat(str.replace("L", ""));
    return Number.isNaN(num) ? 0 : Math.round(num * 100000);
  }

  if (str.endsWith("K")) {
    const num = parseFloat(str.replace("K", ""));
    return Number.isNaN(num) ? 0 : Math.round(num * 1000);
  }

  if (str.endsWith("M")) {
    const num = parseFloat(str.replace("M", ""));
    return Number.isNaN(num) ? 0 : Math.round(num * 1000000);
  }

  if (str.includes("LAKH")) {
    const num = parseFloat(
      str.replace("LAKHS", "").replace("LAKH", "").trim()
    );
    return Number.isNaN(num) ? 0 : Math.round(num * 100000);
  }

  const numeric = Number(str);
  return Number.isNaN(numeric) ? 0 : numeric;
}

function formatCurrency(value: number | string | undefined | null) {
  const num = parseCompactNumber(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function normalizeStatus(value?: string) {
  const status = String(value || "").trim().toUpperCase();
  return status === "ACTIVE" ? "Active" : "Inactive";
}

function normalizeName(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeCode(value?: string) {
  return String(value || "").trim().toLowerCase();
}

const initialForm: NewBranchForm = {
  name: "",
  code: "",
  location: "",
  type: "",
  state: "",
  status: "ACTIVE",
};

export default function BranchOverview() {
  const [period] = useState<PeriodKey>("Weekly");
  const [showAddRow, setShowAddRow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewBranchForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [createdLocalBranches, setCreatedLocalBranches] = useState<
    BranchOverviewItem[]
  >([]);
  const [credentialsByBranchId, setCredentialsByBranchId] = useState<
    Record<string, CreatedUserCredential[]>
  >({});
  const [selectedCredentialsBranchId, setSelectedCredentialsBranchId] =
    useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const [masterBranches, setMasterBranches] = useState<BackendBranchItem[]>([]);
  const [masterLoading, setMasterLoading] = useState(false);

  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  const { data, loading, error } = useSuperDashboard() as {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
  };

  useEffect(() => {
    const fetchAllBranches = async () => {
      try {
        setMasterLoading(true);

        const response = await api.get<BackendBranchesResponse>(
          "/api/sqlbranch/all-branches"
        );

        const list = Array.isArray(response?.data?.branches)
          ? response.data.branches
          : [];

        setMasterBranches(list);
      } catch {
        setMasterBranches([]);
      } finally {
        setMasterLoading(false);
      }
    };

    fetchAllBranches();
  }, []);

  const mergedRawBranches = useMemo<BranchOverviewItem[]>(() => {
    const dashboardBranches = data?.branchOverview || [];

    const masterById = new Map<string, BackendBranchItem>();
    const masterByCode = new Map<string, BackendBranchItem>();
    const masterByName = new Map<string, BackendBranchItem>();

    masterBranches.forEach((item) => {
      if (item?.id !== undefined && item?.id !== null) {
        masterById.set(String(item.id), item);
      }

      if (item?.code) {
        masterByCode.set(normalizeCode(item.code), item);
      }

      if (item?.name) {
        masterByName.set(normalizeName(item.name), item);
      }
    });

    const mergedDashboardBranches = dashboardBranches.map((branch, index) => {
      const branchId =
        branch.id !== undefined && branch.id !== null
          ? String(branch.id)
          : null;

      const branchCode = branch.code ? normalizeCode(branch.code) : null;
      const branchName = normalizeName(branch.branchName || branch.name);

      const matchedMaster =
        (branchId ? masterById.get(branchId) : undefined) ||
        (branchCode ? masterByCode.get(branchCode) : undefined) ||
        (branchName ? masterByName.get(branchName) : undefined);

      return {
        ...branch,
        id:
          branch.id ??
          matchedMaster?.id ??
          branch.code ??
          branch.branchName ??
          branch.name ??
          `branch-${index}`,
        name: branch.branchName || branch.name || matchedMaster?.name || "",
        code: branch.code || matchedMaster?.code || "",
        location: branch.location || matchedMaster?.location || "",
        type: branch.type || matchedMaster?.type || "",
        state: branch.state || matchedMaster?.state || "",
        status: branch.status || matchedMaster?.status || "INACTIVE",
      };
    });

    const existingKeys = new Set(
      mergedDashboardBranches.map((item) =>
        [
          item.id ? `id:${String(item.id)}` : "",
          item.code ? `code:${normalizeCode(item.code)}` : "",
          item.name ? `name:${normalizeName(item.name)}` : "",
        ]
          .filter(Boolean)
          .join("|")
      )
    );

    const masterOnlyBranches: BranchOverviewItem[] = masterBranches
      .filter((item) => {
        const key = [
          item.id ? `id:${String(item.id)}` : "",
          item.code ? `code:${normalizeCode(item.code)}` : "",
          item.name ? `name:${normalizeName(item.name)}` : "",
        ]
          .filter(Boolean)
          .join("|");

        return key && !existingKeys.has(key);
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        location: item.location,
        type: item.type,
        state: item.state,
        status: item.status || "INACTIVE",
        stockItems: 0,
        purchase: 0,
        sales: 0,
        stockIn: 0,
        stockOut: 0,
      }));

    return [
      ...createdLocalBranches,
      ...mergedDashboardBranches,
      ...masterOnlyBranches,
    ];
  }, [data, createdLocalBranches, masterBranches]);

  const tableBranches = useMemo<TableBranch[]>(() => {
    return mergedRawBranches.map((branch, index) => {
      const name = branch.branchName || branch.name || "Unnamed Branch";
      const id = String(
        branch.id ??
          branch.code ??
          name.toLowerCase().replace(/\s+/g, "-") ??
          `branch-${index}`
      );

      const stock = parseCompactNumber(branch.stockItems);
      const purchase = formatCurrency(branch.purchase);
      const sales = formatCurrency(branch.sale ?? branch.sales);
      const stockIn = parseCompactNumber(branch.stockIn);
      const stockOut = parseCompactNumber(branch.stockOut);

      return {
        name,
        id,
        code: branch.code || "",
        location: branch.location || "",
        type: branch.type || "",
        state: branch.state || "",
        status: normalizeStatus(branch.status),
        hasCredentials: Boolean(credentialsByBranchId[id]?.length),
        data: {
          Daily: {
            stock,
            purchase,
            sales,
            in: stockIn,
            out: stockOut,
          },
          Weekly: {
            stock,
            purchase,
            sales,
            in: stockIn,
            out: stockOut,
          },
          Monthly: {
            stock,
            purchase,
            sales,
            in: stockIn,
            out: stockOut,
          },
        },
      };
    });
  }, [mergedRawBranches, credentialsByBranchId]);

  const selectedCredentials = selectedCredentialsBranchId
    ? credentialsByBranchId[selectedCredentialsBranchId] || []
    : [];

  const selectedBranchName = selectedCredentialsBranchId
    ? tableBranches.find((b) => b.id === selectedCredentialsBranchId)?.name ||
      "Branch"
    : "Branch";

  const getStatusStyle = (status: string) => {
    if (status === "Active") return "text-green-600";
    return "text-red-500";
  };

  const handleFormChange = (field: keyof NewBranchForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setFormError("");
    setShowAddRow(false);
  };

  const handleAddRow = () => {
    setForm(initialForm);
    setFormError("");
    setShowAddRow(true);
  };

  const handleCreateBranch = async () => {
    setFormError("");

    if (!form.name || !form.code || !form.location || !form.type || !form.state) {
      setFormError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        location: form.location.trim(),
        type: form.type,
        state: form.state.trim(),
      };

      const response = await api.post("/api/sqlbranch/create-branch", payload);
      const responseData = response?.data;

      const createdBranch = responseData?.branch;
      const createdUsers = responseData?.users || [];

      const localBranch: BranchOverviewItem = {
        id: createdBranch?.id ?? form.code,
        name: createdBranch?.name ?? form.name,
        code: createdBranch?.code ?? form.code,
        location: createdBranch?.location ?? form.location,
        type: createdBranch?.type ?? form.type,
        state: createdBranch?.state ?? form.state,
        status: createdBranch?.status ?? form.status,
        stockItems: 0,
        purchase: 0,
        sales: 0,
        stockIn: 0,
        stockOut: 0,
      };

      const branchId = String(localBranch.id ?? form.code);

      setCreatedLocalBranches((prev) => {
        const exists = prev.some((item) => String(item.id) === branchId);
        if (exists) {
          return prev.map((item) =>
            String(item.id) === branchId ? localBranch : item
          );
        }
        return [localBranch, ...prev];
      });

      setCredentialsByBranchId((prev) => ({
        ...prev,
        [branchId]: createdUsers,
      }));

      setSelectedCredentialsBranchId(branchId);
      setShowPasswords(false);
      resetForm();
    } catch (err: any) {
      const backendError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to create branch";
      setFormError(backendError);
    } finally {
      setSaving(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el) return;

    dragStateRef.current.isDown = true;
    dragStateRef.current.startX = e.pageX - el.offsetLeft;
    dragStateRef.current.scrollLeft = el.scrollLeft;
    setIsDragging(true);
  };

  const handleMouseLeave = () => {
    dragStateRef.current.isDown = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    dragStateRef.current.isDown = false;
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el || !dragStateRef.current.isDown) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStateRef.current.startX) * 1.2;
    el.scrollLeft = dragStateRef.current.scrollLeft - walk;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-sm w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-6 py-5 border-b">
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold text-[#0F172A]">
              Branch Overview
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Latest System Activities and updates
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            <button
              onClick={handleAddRow}
              disabled={showAddRow}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Branch
            </button>
          </div>
        </div>

        <div
          ref={tableScrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto overflow-y-hidden w-full touch-pan-x select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}
        >
          <table className="w-full min-w-[1180px] lg:min-w-[1280px]">
            <thead>
              <tr className="bg-[#F8FAFC] text-left">
                {[
                  "Branch Name",
                  "Code",
                  "Location",
                  "Type",
                  "State",
                  "Stock Items",
                  "Purchase",
                  "Sales",
                  "Stock IN",
                  "Stock OUT",
                  "Action",
                  "Credentials",
                  "Status",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-3 sm:px-4 lg:px-6 py-4 text-[13px] font-medium text-[#475569] whitespace-nowrap"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {showAddRow && (
                <tr className="border-b bg-[#F8FAFC] align-top">
                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] min-w-[180px]">
                    <input
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Branch name"
                      className="w-full rounded-lg border border-[#D7DFE9] px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    />
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] min-w-[130px]">
                    <input
                      value={form.code}
                      onChange={(e) => handleFormChange("code", e.target.value)}
                      placeholder="Code"
                      className="w-full rounded-lg border border-[#D7DFE9] px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    />
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] min-w-[170px]">
                    <input
                      value={form.location}
                      onChange={(e) =>
                        handleFormChange("location", e.target.value)
                      }
                      placeholder="Location"
                      className="w-full rounded-lg border border-[#D7DFE9] px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    />
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] min-w-[170px]">
                    <select
                      value={form.type}
                      onChange={(e) => handleFormChange("type", e.target.value)}
                      className="w-full rounded-lg border border-[#D7DFE9] px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Type</option>
                      {BRANCH_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] min-w-[150px]">
                    <input
                      value={form.state}
                      onChange={(e) => handleFormChange("state", e.target.value)}
                      placeholder="State (e.g. Delhi)"
                      className="w-full rounded-lg border border-[#D7DFE9] px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    />
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                    0
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                    ₹0
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                    ₹0
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                    0
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] min-w-[210px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleCreateBranch}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saving ? "Creating..." : "Create"}
                      </button>

                      <button
                        onClick={resetForm}
                        disabled={saving}
                        className="border border-[#D7DFE9] text-[#475569] px-4 py-2 text-sm rounded-lg hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] text-[#94A3B8] whitespace-nowrap text-center">
                    —
                  </td>

                  <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] min-w-[140px]">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        handleFormChange("status", e.target.value)
                      }
                      className="w-full rounded-lg border border-[#D7DFE9] px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                </tr>
              )}

              {showAddRow && formError && (
                <tr>
                  <td
                    colSpan={13}
                    className="px-3 sm:px-4 lg:px-6 py-3 text-sm text-red-500 border-b border-[#E2E2E2]"
                  >
                    {formError}
                  </td>
                </tr>
              )}

              {loading || masterLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    {Array.from({ length: 13 }).map((__, idx) => (
                      <td
                        key={idx}
                        className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2]"
                      >
                        <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-3 sm:px-4 lg:px-6 py-10 text-center text-sm text-red-500"
                  >
                    {error || "Failed to load branch overview"}
                  </td>
                </tr>
              ) : tableBranches.length > 0 ? (
                tableBranches.map((branch) => {
                  const row = branch.data[period];

                  return (
                    <tr
                      key={branch.id}
                      className="border-b hover:bg-[#F8FAFC] transition"
                    >
                      <td className="px-3 sm:px-4 lg:px-6 py-4 font-medium text-[#0F172A] border border-[#E2E2E2] whitespace-nowrap">
                        {branch.name}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {branch.code || "-"}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {branch.location || "-"}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {branch.type || "-"}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {branch.state || "-"}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {row.stock}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {row.purchase}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {row.sales}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {row.in}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-[#334155] border border-[#E2E2E2] whitespace-nowrap">
                        {row.out}
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] whitespace-nowrap">
                        <Link
                          href={`/super-admin/Branches/${branch.id}`}
                          className="text-blue-600 text-sm font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>

                      <td className="px-3 sm:px-4 lg:px-6 py-4 border border-[#E2E2E2] whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (!branch.hasCredentials) return;
                            setSelectedCredentialsBranchId(branch.id);
                            setShowPasswords(false);
                          }}
                          disabled={!branch.hasCredentials}
                          className={`inline-flex items-center justify-center ${
                            branch.hasCredentials
                              ? "text-blue-600 hover:text-blue-700"
                              : "text-[#94A3B8] cursor-not-allowed"
                          }`}
                          title={
                            branch.hasCredentials
                              ? "View credentials"
                              : "Credentials unavailable"
                          }
                        >
                          <Eye size={18} />
                        </button>
                      </td>

                      <td
                        className={`px-3 sm:px-4 lg:px-6 py-4 font-medium whitespace-nowrap ${getStatusStyle(
                          branch.status
                        )}`}
                      >
                        {branch.status}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={13}
                    className="px-3 sm:px-4 lg:px-6 py-10 text-center text-sm text-[#64748B]"
                  >
                    No branch data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCredentialsBranchId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-[#EEF2F6] overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b">
              <div>
                <h3 className="text-[18px] font-semibold text-[#0F172A]">
                  Generated Credentials
                </h3>
                <p className="text-[13px] text-[#64748B] mt-1">
                  {selectedBranchName} branch users from backend response
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCredentialsBranchId(null);
                  setShowPasswords(false);
                }}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-4">
              <div className="flex items-center justify-end mb-4">
                <button
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-left">
                      {["Role", "Email", "Password"].map((head) => (
                        <th
                          key={head}
                          className="px-4 py-3 text-[13px] font-medium text-[#475569]"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCredentials.length > 0 ? (
                      selectedCredentials.map((item, index) => (
                        <tr key={`${item.email}-${index}`} className="border-b">
                          <td className="px-4 py-3 text-sm text-[#0F172A] capitalize">
                            {item.role.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#334155] break-all">
                            {item.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#334155]">
                            {showPasswords ? item.password : "••••••••"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-sm text-[#64748B]"
                        >
                          No credentials available for this branch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setSelectedCredentialsBranchId(null);
                  setShowPasswords(false);
                }}
                className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}