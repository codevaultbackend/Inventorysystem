"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Plus, X } from "lucide-react";
import { useSuperDashboard } from "@/app/context/SuperDashboardContext";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "../../../../lib/api";

type BranchOverviewItem = {
  id?: number;
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
  id?: number;
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

type BranchCredentialUser = {
  id: number | string;
  name: string;
  email: string;
  role: string | null;
  branch_id: number | string | null;
  password: string | null;
};

type BranchCredentialsResponse = {
  success?: boolean;
  branch_id?: number | string | null;
  total?: number;
  users?: BranchCredentialUser[];
  error?: string;
  message?: string;
};

type ToggleBranchResponse = {
  success?: boolean;
  message?: string;
  branch?: {
    id?: number | string;
    status?: string;
  };
  error?: string;
};

type TableBranch = {
  id: number;
  name: string;
  code?: string;
  location?: string;
  type?: string;
  state?: string;
  status: string;
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

const initialForm: NewBranchForm = {
  name: "",
  code: "",
  location: "",
  type: "",
  state: "",
  status: "ACTIVE",
};

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

function BranchOverviewHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-none px-4 py-5 animate-pulse sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <div className="h-6 w-40 rounded bg-[#E9EEF5]" />
        <div className="mt-2 h-4 w-56 rounded bg-[#E9EEF5]" />
      </div>
      <div className="w-full sm:w-auto">
        <div className="h-10 w-full rounded-lg bg-[#E9EEF5] sm:w-[128px]" />
      </div>
    </div>
  );
}

function BranchOverviewTableSkeleton() {
  return (
    <div className="animate-pulse">
      <table className="w-full min-w-[1320px] lg:min-w-[1400px]">
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
              "Credentials",
              "Status",
            ].map((head) => (
              <th
                key={head}
                className="whitespace-nowrap px-3 py-4 text-[13px] font-medium text-[#475569] sm:px-4 lg:px-6"
              >
                <div className="h-4 w-20 rounded bg-[#E9EEF5]" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={index} className="border-b">
              {Array.from({ length: 12 }).map((__, tdIndex) => (
                <td
                  key={tdIndex}
                  className="border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6"
                >
                  <div className="h-4 w-20 rounded bg-[#E9EEF5]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BranchOverview() {
  const [period] = useState<PeriodKey>("Weekly");
  const [showAddRow, setShowAddRow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewBranchForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [createdLocalBranches, setCreatedLocalBranches] = useState<
    BranchOverviewItem[]
  >([]);

  const [masterBranches, setMasterBranches] = useState<BackendBranchItem[]>([]);
  const [masterLoading, setMasterLoading] = useState(false);

  const [credentialsByBranchId, setCredentialsByBranchId] = useState<
    Record<string, BranchCredentialUser[]>
  >({});
  const [selectedCredentialsBranchId, setSelectedCredentialsBranchId] =
    useState<number | null>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [toggleLoadingByBranchId, setToggleLoadingByBranchId] = useState<
    Record<string, boolean>
  >({});
  const [actionError, setActionError] = useState("");

  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  const { user } = useAuth();
  const currentRole = user?.role?.name || user?.role || "";

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
          "/sqlbranch/branches"
        );

        const list = Array.isArray(response?.data?.branches)
          ? response.data.branches
          : [];

        setMasterBranches(list);
      } catch (err) {
        console.error("Failed to fetch all branches:", err);
        setMasterBranches([]);
      } finally {
        setMasterLoading(false);
      }
    };

    fetchAllBranches();
  }, []);

  const mergedRawBranches = useMemo<BranchOverviewItem[]>(() => {
    const dashboardBranches = data?.branchOverview || [];

    const masterById = new Map<number, BackendBranchItem>();
    const masterByCode = new Map<string, BackendBranchItem>();
    const masterByName = new Map<string, BackendBranchItem>();

    masterBranches.forEach((item) => {
      if (typeof item?.id === "number") {
        masterById.set(item.id, item);
      }
      if (item?.code) {
        masterByCode.set(normalizeCode(item.code), item);
      }
      if (item?.name) {
        masterByName.set(normalizeName(item.name), item);
      }
    });

    const mergedDashboardBranches = dashboardBranches
      .map((branch) => {
        const matchedMaster =
          (typeof branch.id === "number" ? masterById.get(branch.id) : undefined) ||
          (branch.code ? masterByCode.get(normalizeCode(branch.code)) : undefined) ||
          ((branch.branchName || branch.name)
            ? masterByName.get(normalizeName(branch.branchName || branch.name))
            : undefined);

        const finalId =
          typeof branch.id === "number"
            ? branch.id
            : typeof matchedMaster?.id === "number"
            ? matchedMaster.id
            : undefined;

        if (typeof finalId !== "number") {
          return null;
        }

        return {
          ...branch,
          id: finalId,
          name: branch.branchName || branch.name || matchedMaster?.name || "",
          code: branch.code || matchedMaster?.code || "",
          location: branch.location || matchedMaster?.location || "",
          type: branch.type || matchedMaster?.type || "",
          state: branch.state || matchedMaster?.state || "",
          status: branch.status || matchedMaster?.status || "INACTIVE",
        };
      })
      .filter(Boolean) as BranchOverviewItem[];

    const existingIds = new Set(
      mergedDashboardBranches
        .map((item) => item.id)
        .filter((id): id is number => typeof id === "number")
    );

    const localNumericBranches = createdLocalBranches.filter(
      (item): item is BranchOverviewItem & { id: number } =>
        typeof item.id === "number"
    );

    const masterOnlyBranches: BranchOverviewItem[] = masterBranches
      .filter((item) => typeof item.id === "number" && !existingIds.has(item.id))
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

    return [...localNumericBranches, ...mergedDashboardBranches, ...masterOnlyBranches]
      .filter((item) => typeof item.id === "number");
  }, [data, createdLocalBranches, masterBranches]);

  const tableBranches = useMemo<TableBranch[]>(() => {
    return mergedRawBranches
      .filter((branch) => typeof branch.id === "number")
      .map((branch) => {
        const name = branch.branchName || branch.name || "Unnamed Branch";
        const stock = parseCompactNumber(branch.stockItems);
        const purchase = formatCurrency(branch.purchase);
        const sales = formatCurrency(branch.sale ?? branch.sales);
        const stockIn = parseCompactNumber(branch.stockIn);
        const stockOut = parseCompactNumber(branch.stockOut);

        return {
          id: branch.id as number,
          name,
          code: branch.code || "",
          location: branch.location || "",
          type: branch.type || "",
          state: branch.state || "",
          status: normalizeStatus(branch.status),
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
  }, [mergedRawBranches]);

  const selectedCredentials =
    selectedCredentialsBranchId !== null
      ? credentialsByBranchId[String(selectedCredentialsBranchId)] || []
      : [];

  const selectedBranchName =
    selectedCredentialsBranchId !== null
      ? tableBranches.find((b) => b.id === selectedCredentialsBranchId)?.name ||
        "Branch"
      : "Branch";

  const getStatusStyle = (status: string) => {
    if (status === "Active") {
      return "bg-green-50 text-green-600 border border-green-200";
    }
    return "bg-red-50 text-red-500 border border-red-200";
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

      const response = await api.post("/sqlbranch/create-branch", payload);
      const responseData = response?.data;
      const createdBranch = responseData?.branch;

      const localBranch: BranchOverviewItem = {
        id: Number(createdBranch?.id),
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

      if (!localBranch.id || Number.isNaN(localBranch.id)) {
        setFormError("Created branch id not returned from backend");
        return;
      }

      setCreatedLocalBranches((prev) => {
        const exists = prev.some((item) => item.id === localBranch.id);
        if (exists) {
          return prev.map((item) =>
            item.id === localBranch.id ? localBranch : item
          );
        }
        return [localBranch, ...prev];
      });

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

  const handleViewCredentials = async (branchId: number) => {
    if (!branchId || Number.isNaN(branchId)) {
      setCredentialsError("Invalid branch id");
      return;
    }

    setSelectedCredentialsBranchId(branchId);
    setShowPasswords(false);
    setCredentialsError("");

    if (credentialsByBranchId[String(branchId)]?.length) {
      return;
    }

    try {
      setLoadingCredentials(true);

      const response = await api.get<BranchCredentialsResponse>(
        `/sqlbranch/d/get-branch-user/${branchId}`
      );

      const users = Array.isArray(response?.data?.users) ? response.data.users : [];

      setCredentialsByBranchId((prev) => ({
        ...prev,
        [String(branchId)]: users,
      }));
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to fetch branch user credentials";

      setCredentialsError(message);
      setCredentialsByBranchId((prev) => ({
        ...prev,
        [String(branchId)]: [],
      }));
    } finally {
      setLoadingCredentials(false);
    }
  };

  const handleToggleBranchStatus = async (branchId: number) => {
    if (!branchId || Number.isNaN(branchId)) {
      setActionError("Invalid branch id");
      return;
    }

    try {
      setActionError("");
      setToggleLoadingByBranchId((prev) => ({
        ...prev,
        [String(branchId)]: true,
      }));

      const response = await api.put<ToggleBranchResponse>(
        `sqlbranch/branch/${branchId}/toggle`
      );

      const updatedStatus = response?.data?.branch?.status;

      if (updatedStatus) {
        setMasterBranches((prev) =>
          prev.map((item) =>
            item.id === branchId ? { ...item, status: updatedStatus } : item
          )
        );

        setCreatedLocalBranches((prev) =>
          prev.map((item) =>
            item.id === branchId ? { ...item, status: updatedStatus } : item
          )
        );
      }
    } catch (err: any) {
      setActionError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to toggle branch status"
      );
    } finally {
      setToggleLoadingByBranchId((prev) => ({
        ...prev,
        [String(branchId)]: false,
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el || loading || masterLoading) return;

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
    if (!el || !dragStateRef.current.isDown || loading || masterLoading) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStateRef.current.startX) * 1.2;
    el.scrollLeft = dragStateRef.current.scrollLeft - walk;
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white shadow-[1px_1px_4px_rgba(0,0,0,0.1)]">
        {loading || masterLoading ? (
          <BranchOverviewHeaderSkeleton />
        ) : (
          <div className="flex flex-col gap-4 border-none px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h3 className="text-[18px] font-semibold text-[#0F172A]">
                Branch Overview
              </h3>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Latest system activities and updates
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <button
                onClick={handleAddRow}
                disabled={showAddRow}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Plus size={16} />
                Add Branch
              </button>
            </div>
          </div>
        )}

        {actionError ? (
          <div className="px-4 pb-2 text-sm text-red-500 sm:px-6">
            {actionError}
          </div>
        ) : null}

        <div
          ref={tableScrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`w-full select-none overflow-x-auto overflow-y-hidden touch-pan-x ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}
        >
          {loading || masterLoading ? (
            <BranchOverviewTableSkeleton />
          ) : (
            <table className="w-full min-w-[1320px] lg:min-w-[1400px]">
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
                    "Credentials",
                    "Status",
                  ].map((head) => (
                    <th
                      key={head}
                      className="whitespace-nowrap px-3 py-4 text-[13px] font-medium text-[#475569] sm:px-4 lg:px-6"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {showAddRow && (
                  <tr className="align-top bg-[#F8FAFC]">
                    <td className="min-w-[180px] border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                      <input
                        value={form.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        placeholder="Branch name"
                        className="w-full rounded-lg border border-[#D7DFE9] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="min-w-[130px] border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                      <input
                        value={form.code}
                        onChange={(e) => handleFormChange("code", e.target.value)}
                        placeholder="Code"
                        className="w-full rounded-lg border border-[#D7DFE9] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="min-w-[170px] border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                      <input
                        value={form.location}
                        onChange={(e) =>
                          handleFormChange("location", e.target.value)
                        }
                        placeholder="Location"
                        className="w-full rounded-lg border border-[#D7DFE9] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="min-w-[170px] border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                      <select
                        value={form.type}
                        onChange={(e) => handleFormChange("type", e.target.value)}
                        className="w-full rounded-lg border border-[#D7DFE9] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">Select Type</option>
                        {BRANCH_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="min-w-[150px] border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                      <input
                        value={form.state}
                        onChange={(e) => handleFormChange("state", e.target.value)}
                        placeholder="State"
                        className="w-full rounded-lg border border-[#D7DFE9] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                      0
                    </td>
                    <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                      ₹0
                    </td>
                    <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                      ₹0
                    </td>
                    <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                      0
                    </td>

                    <td className="min-w-[210px] border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleCreateBranch}
                          disabled={saving}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? "Creating..." : "Create"}
                        </button>

                        <button
                          onClick={resetForm}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#D7DFE9] px-4 py-2 text-sm text-[#475569] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </td>

                    <td className="min-w-[180px] border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                      <select
                        value={form.status}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#D7DFE9] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
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
                      colSpan={12}
                      className="border-b border-[#E2E2E2] px-3 py-3 text-sm text-red-500 sm:px-4 lg:px-6"
                    >
                      {formError}
                    </td>
                  </tr>
                )}

                {error ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-3 py-10 text-center text-sm text-red-500 sm:px-4 lg:px-6"
                    >
                      {error || "Failed to load branch overview"}
                    </td>
                  </tr>
                ) : tableBranches.length > 0 ? (
                  tableBranches.map((branch) => {
                    const row = branch.data[period];
                    const isToggling =
                      !!toggleLoadingByBranchId[String(branch.id)];

                    return (
                      <tr key={branch.id} className="transition hover:bg-[#F8FAFC]">
                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 font-medium text-[#0F172A] sm:px-4 lg:px-6">
                          {branch.name}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {branch.code || "-"}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {branch.location || "-"}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {branch.type || "-"}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {branch.state || "-"}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {row.stock}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {row.purchase}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {row.sales}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {row.in}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 text-[#334155] sm:px-4 lg:px-6">
                          {row.out}
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                          <button
                            onClick={() => handleViewCredentials(branch.id)}
                            className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700"
                            title="View branch user credentials"
                          >
                            <Eye size={18} />
                          </button>
                        </td>

                        <td className="whitespace-nowrap border border-[#E2E2E2] px-3 py-4 sm:px-4 lg:px-6">
                          <button
                            onClick={() => handleToggleBranchStatus(branch.id)}
                            disabled={isToggling}
                            className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition ${
                              getStatusStyle(branch.status)
                            } ${
                              isToggling ? "cursor-not-allowed opacity-70" : ""
                            }`}
                            title={
                              currentRole === "admin" || currentRole === "super_admin"
                                ? "Toggle branch status"
                                : "You do not have permission"
                            }
                          >
                            {isToggling ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              branch.status
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-3 py-10 text-center text-sm text-[#64748B] sm:px-4 lg:px-6"
                    >
                      No branch data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedCredentialsBranchId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-[18px] font-semibold text-[#0F172A]">
                  Branch User Credentials
                </h3>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  {selectedBranchName} branch users
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCredentialsBranchId(null);
                  setShowPasswords(false);
                  setCredentialsError("");
                }}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <div className="mb-4 flex items-center justify-end">
                <button
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </button>
              </div>

              {loadingCredentials ? (
                <div className="flex min-h-[180px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : credentialsError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                  {credentialsError}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-left">
                        {[
                          "User ID",
                          "Name",
                          "Email",
                          "Role",
                          "Branch ID",
                          "Password",
                        ].map((head) => (
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
                            <td className="px-4 py-3 text-sm text-[#0F172A]">
                              {item.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#0F172A]">
                              {item.name || "-"}
                            </td>
                            <td className="break-all px-4 py-3 text-sm text-[#334155]">
                              {item.email}
                            </td>
                            <td className="px-4 py-3 text-sm capitalize text-[#334155]">
                              {item.role ? item.role.replace(/_/g, " ") : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#334155]">
                              {item.branch_id ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#334155]">
                              {showPasswords ? item.password || "-" : "••••••••"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-sm text-[#64748B]"
                          >
                            No credentials available for this branch.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t px-5 py-4 sm:px-6">
              <button
                onClick={() => {
                  setSelectedCredentialsBranchId(null);
                  setShowPasswords(false);
                  setCredentialsError("");
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
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