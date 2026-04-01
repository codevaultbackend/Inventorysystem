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
    <div className="flex animate-pulse flex-col gap-4 border-none px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
  const [isAddOpen, setIsAddOpen] = useState(false);
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

  useEffect(() => {
    const handleWindowMouseUp = () => {
      dragStateRef.current.isDown = false;
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
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
          (typeof branch.id === "number"
            ? masterById.get(branch.id)
            : undefined) ||
          (branch.code
            ? masterByCode.get(normalizeCode(branch.code))
            : undefined) ||
          (branch.branchName || branch.name
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
      .filter(
        (item) => typeof item.id === "number" && !existingIds.has(item.id)
      )
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
      ...localNumericBranches,
      ...mergedDashboardBranches,
      ...masterOnlyBranches,
    ].filter((item) => typeof item.id === "number");
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

  const closeAddModal = () => {
    if (saving) return;
    setForm(initialForm);
    setFormError("");
    setIsAddOpen(false);
  };

  const handleAddRow = () => {
    setForm(initialForm);
    setFormError("");
    setIsAddOpen(true);
  };

  const handleCreateBranch = async () => {
    setFormError("");

    if (
      !form.name ||
      !form.code ||
      !form.location ||
      !form.type ||
      !form.state
    ) {
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

      closeAddModal();
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

      const users = Array.isArray(response?.data?.users)
        ? response.data.users
        : [];

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
        `/sqlbranch/branch/${branchId}/toggle`
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

  const stopDragging = () => {
    dragStateRef.current.isDown = false;
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el || loading || masterLoading) return;

    dragStateRef.current.isDown = true;
    dragStateRef.current.startX = e.pageX;
    dragStateRef.current.scrollLeft = el.scrollLeft;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el || !dragStateRef.current.isDown || loading || masterLoading) return;

    e.preventDefault();
    const walk = (e.pageX - dragStateRef.current.startX) * 1.2;
    el.scrollLeft = dragStateRef.current.scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el || loading || masterLoading) return;

    dragStateRef.current.isDown = true;
    dragStateRef.current.startX = e.touches[0].pageX;
    dragStateRef.current.scrollLeft = el.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el || !dragStateRef.current.isDown || loading || masterLoading) return;

    const walk = (e.touches[0].pageX - dragStateRef.current.startX) * 1.2;
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
                disabled={isAddOpen}
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
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDragging}
          className={`hide-scrollbar w-full overflow-auto touch-pan-x ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
            userSelect: isDragging ? "none" : "auto",
            maxHeight: "460px",
          }}
        >
          {loading || masterLoading ? (
            <BranchOverviewTableSkeleton />
          ) : (
            <table className="w-full min-w-[1320px] lg:min-w-[1400px]">
              <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
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
                      <tr
                        key={branch.id}
                        className="transition hover:bg-[#F8FAFC]"
                      >
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
                            className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition ${getStatusStyle(
                              branch.status
                            )} ${
                              isToggling ? "cursor-not-allowed opacity-70" : ""
                            }`}
                            title={
                              currentRole === "admin" ||
                              currentRole === "super_admin"
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

      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-0 backdrop-blur-[2px] transition-all duration-300 sm:p-4"
          onClick={closeAddModal}
        >
          <div className="flex min-h-[100dvh] items-end justify-center sm:items-center">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-[#EEF2F6] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] transition-all duration-300 sm:h-auto sm:max-h-[92vh] sm:max-w-[760px] sm:rounded-[28px]"
            >
              <div className="shrink-0 border-b border-[#EEF2F6] px-4 py-4 sm:px-6 sm:py-5">
                <div className="mb-3 flex justify-center sm:hidden">
                  <div className="h-1.5 w-12 rounded-full bg-[#D9E2EC]" />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[20px] font-semibold text-[#0F172A] sm:text-[22px]">
                      Add Branch
                    </h3>
                    <p className="mt-1 text-[13px] text-[#64748B] sm:text-[14px]">
                      Create a new branch without changing the existing table
                      layout
                    </p>
                  </div>

                  <button
                    onClick={closeAddModal}
                    disabled={saving}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <BranchField
                    label="Branch Name"
                    value={form.name}
                    onChange={(value) => handleFormChange("name", value)}
                    placeholder="Branch name"
                    required
                  />

                  <BranchField
                    label="Code"
                    value={form.code}
                    onChange={(value) => handleFormChange("code", value)}
                    placeholder="Code"
                    required
                  />

                  <BranchField
                    label="Location"
                    value={form.location}
                    onChange={(value) => handleFormChange("location", value)}
                    placeholder="Location"
                    required
                  />

                  <BranchSelectField
                    label="Type"
                    value={form.type}
                    onChange={(value) =>
                      handleFormChange("type", value as NewBranchForm["type"])
                    }
                    required
                    options={[
                      { label: "Select Type", value: "" },
                      ...BRANCH_TYPE_OPTIONS.map((option) => ({
                        label: option.label,
                        value: option.value,
                      })),
                    ]}
                  />

                  <BranchField
                    label="State"
                    value={form.state}
                    onChange={(value) => handleFormChange("state", value)}
                    placeholder="State"
                    required
                  />

                  <BranchSelectField
                    label="Status"
                    value={form.status}
                    onChange={(value) =>
                      handleFormChange(
                        "status",
                        value as NewBranchForm["status"]
                      )
                    }
                    options={[
                      { label: "ACTIVE", value: "ACTIVE" },
                      { label: "INACTIVE", value: "INACTIVE" },
                    ]}
                  />
                </div>

                <div className="mt-5 rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#64748B]">
                        Default Values
                      </p>
                      <h4 className="mt-1 text-[18px] font-semibold text-[#0F172A]">
                        Stock: 0 · Purchase: ₹0 · Sales: ₹0
                      </h4>
                    </div>

                    <div className="text-[12px] font-medium text-[#94A3B8] sm:text-right">
                      Branch will be added with initial zero metrics
                    </div>
                  </div>
                </div>

                {formError ? (
                  <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                    {formError}
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-[#EEF2F6] bg-white px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={closeAddModal}
                    disabled={saving}
                    className="inline-flex h-[48px] w-full items-center justify-center rounded-[14px] border border-[#D7DFE9] bg-white px-5 text-[14px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateBranch}
                    disabled={saving}
                    className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-5 text-[14px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Branch
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCredentialsBranchId !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-0 backdrop-blur-[2px] transition-all duration-300 sm:p-4"
          onClick={() => {
            if (loadingCredentials) return;
            setSelectedCredentialsBranchId(null);
            setCredentialsError("");
            setShowPasswords(false);
          }}
        >
          <div className="flex min-h-[100dvh] items-end justify-center sm:items-center">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-[#EEF2F6] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] transition-all duration-300 sm:h-auto sm:max-h-[90vh] sm:max-w-[980px] sm:rounded-[28px]"
            >
              <div className="shrink-0 border-b border-[#EEF2F6] px-4 py-4 sm:px-6 sm:py-5">
                <div className="mb-3 flex justify-center sm:hidden">
                  <div className="h-1.5 w-12 rounded-full bg-[#D9E2EC]" />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[20px] font-semibold text-[#0F172A] sm:text-[22px]">
                      {selectedBranchName} Credentials
                    </h3>
                    <p className="mt-1 text-[13px] text-[#64748B] sm:text-[14px]">
                      View branch user login details
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPasswords((prev) => !prev)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 text-[#64748B] transition hover:bg-[#F8FAFC]"
                    >
                      {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span className="hidden text-sm sm:inline">
                        {showPasswords ? "Hide" : "Show"} Passwords
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (loadingCredentials) return;
                        setSelectedCredentialsBranchId(null);
                        setCredentialsError("");
                        setShowPasswords(false);
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-[#F8FAFC]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-5">
                {credentialsError ? (
                  <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                    {credentialsError}
                  </div>
                ) : null}

                {loadingCredentials ? (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-[#EEF2F6]">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-[#F8FAFC]">
                        <tr className="text-left">
                          <th className="whitespace-nowrap px-4 py-4 text-[13px] font-medium text-[#475569]">
                            ID
                          </th>
                          <th className="whitespace-nowrap px-4 py-4 text-[13px] font-medium text-[#475569]">
                            Name
                          </th>
                          <th className="whitespace-nowrap px-4 py-4 text-[13px] font-medium text-[#475569]">
                            Email
                          </th>
                          <th className="whitespace-nowrap px-4 py-4 text-[13px] font-medium text-[#475569]">
                            Role
                          </th>
                          <th className="whitespace-nowrap px-4 py-4 text-[13px] font-medium text-[#475569]">
                            Branch ID
                          </th>
                          <th className="whitespace-nowrap px-4 py-4 text-[13px] font-medium text-[#475569]">
                            Password
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedCredentials.length > 0 ? (
                          selectedCredentials.map((item, index) => (
                            <tr
                              key={`${item.id}-${index}`}
                              className="border-t border-[#EEF2F6] transition hover:bg-[#F8FAFC]"
                            >
                              <td className="whitespace-nowrap px-4 py-4 text-[14px] text-[#334155]">
                                {item.id ?? "-"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-[14px] text-[#334155]">
                                {item.name || "-"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-[14px] text-[#334155]">
                                {item.email || "-"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-[14px] text-[#334155]">
                                {item.role || "-"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-[14px] text-[#334155]">
                                {item.branch_id ?? "-"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-[14px] text-[#334155]">
                                {showPasswords
                                  ? item.password || "-"
                                  : "••••••••"}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type BranchFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

function BranchField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: BranchFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155]">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[48px] w-full rounded-[14px] border border-[#D7DFE9] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-blue-500"
      />
    </label>
  );
}

type BranchSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
};

function BranchSelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: BranchSelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155]">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[48px] w-full rounded-[14px] border border-[#D7DFE9] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition-all duration-200 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}