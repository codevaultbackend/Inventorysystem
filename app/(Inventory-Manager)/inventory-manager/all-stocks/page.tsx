"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X, Package2, Loader2 } from "lucide-react";
import InventoryOverviewCards from "../../Components/InventoryOverviewCards";
import StockCategoryBarChart from "../../Components/StockCategoryBarChart";
import HierarchyTable from "../../Components/HierarchyTable";
import { useAuth } from "@/app/context/AuthContext";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
  slugifyText,
} from "@/app/lib/inventoryDashboardApi";

type AddItemForm = {
  item: string;
  category: string;
  hsn: string;
  grn: string;
  purchaseOrder: string;
  quantity: string;
  rate: string;
};

const initialForm: AddItemForm = {
  item: "",
  category: "",
  hsn: "",
  grn: "",
  purchaseOrder: "",
  quantity: "",
  rate: "",
};

export default function InventoryBranchPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const stateName = decodeURIComponent((params?.state as string) || "");

  const branchId = String(
    user?.branch_id ||
      user?.branchId ||
      user?.branch?.id ||
      user?.branches?.[0]?.id ||
      user?.branches?.[0] ||
      ""
  );

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [form, setForm] = useState<AddItemForm>(initialForm);

  const fetchBranchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      if (!branchId) {
        throw new Error("Branch ID not found in auth context");
      }

      const res = await inventoryDashboardApi.get(
        `/combine/dashboard/branch-Id/${encodeURIComponent(branchId)}`
      );

      console.log("API response:", res.data);

      if (res.data?.success) {
        setData(res.data);
      } else {
        throw new Error(res.data?.message || "Invalid API response");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load branch details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchBranchDetails();
    }
  }, [branchId, authLoading]);

  const itemRows = useMemo(() => {
    const raw = data?.allItems || data?.items || [];

    return raw.map((item: any) => ({
      itemName: item.item || item.itemName || item.name || "NA",
      slugItemName: slugifyText(item.item || item.itemName || item.name || ""),
      totalQty: toNumber(item.totalQty || item.qty || item.totalStock),
      totalValue: toNumber(item.totalValue || item.value || item.stockValue),
    }));
  }, [data]);

  const estimatedValue = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);
    return quantity * rate;
  }, [form.quantity, form.rate]);

  const handleInputChange =
    (field: keyof AddItemForm) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setSubmitError("");
      setSubmitSuccess("");
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const closeModal = () => {
    if (submitting) return;
    setIsAddOpen(false);
    setSubmitError("");
    setSubmitSuccess("");
    setForm(initialForm);
  };

  const validateForm = () => {
    if (!form.item.trim()) return "Item name is required";
    if (!form.quantity.trim()) return "Quantity is required";
    if (!form.rate.trim()) return "Rate is required";

    const quantity = Number(form.quantity);
    const rate = Number(form.rate);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return "Quantity must be greater than 0";
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      return "Rate must be greater than 0";
    }

    return "";
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      const payload = {
        item: form.item.trim(),
        category: form.category.trim(),
        hsn: form.hsn.trim(),
        grn: form.grn.trim(),
        purchaseOrder: form.purchaseOrder.trim(),
        quantity: Number(form.quantity),
        rate: Number(form.rate),
      };

      const res = await inventoryDashboardApi.post("combine/add-stock", payload);

      if (res.data?.success) {
        setSubmitSuccess("Stock item added successfully");
        await fetchBranchDetails();

        setTimeout(() => {
          closeModal();
        }, 700);
      } else {
        throw new Error(res.data?.message || "Failed to add stock item");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add stock item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-5 lg:px-6 animate-pulse">
          <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="h-8 w-[220px] rounded-md bg-[#E5E7EB]" />
            <div className="mt-2 h-4 w-[240px] rounded-md bg-[#E5E7EB]" />
          </div>

          <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="bg-[#F3F6F9]">
                  <tr>
                    {[...Array(4)].map((_, index) => (
                      <th key={index} className="px-6 py-4 text-left">
                        <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-t border-[#EDF2F7]"
                    >
                      {[...Array(4)].map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                          <div className="h-4 w-full max-w-[120px] rounded bg-[#E5E7EB]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F7F9FB] ">
        <div className="mx-auto w-full max-w-[1440px] space-y-6">
          <div className="flex flex-col gap-4 rounded-[24px] border border-[#E6E6E6] bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                Inventory Items
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#64748B]">
                Item wise inventory summary
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmitError("");
                setSubmitSuccess("");
                setIsAddOpen(true);
              }}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[14px] border border-[#D9E2EC] bg-[#0F172A] px-4 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#111C33] active:translate-y-0"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          <HierarchyTable
            title="Inventory Items"
            subtitle="Item wise inventory summary"
            data={itemRows}
            getViewHref={(row) =>
              `/inventory-manager/all-stocks/${encodeURIComponent(
                row.slugItemName
              )}`
            }
            columns={[
              {
                key: "itemName",
                title: "Item Name",
                render: (row) => row.itemName || "-",
              },
              {
                key: "totalQty",
                title: "Total Qty",
                render: (row) => formatNumber(toNumber(row.totalQty)),
              },
              {
                key: "totalValue",
                title: "Total Value",
                render: (row) => formatCurrency(toNumber(row.totalValue)),
              },
            ]}
          />
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${
          isAddOpen
            ? "pointer-events-auto bg-[rgba(15,23,42,0.42)] backdrop-blur-[2px]"
            : "pointer-events-none bg-transparent"
        }`}
        onClick={closeModal}
      >
        <div className="flex min-h-[100dvh] items-end justify-center p-0 sm:items-center sm:p-4 md:p-6">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex h-[100dvh] w-full transform flex-col overflow-hidden rounded-t-[28px] border border-[#E2E8F0] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] transition-all duration-300 sm:h-auto sm:max-h-[92vh] sm:max-w-[760px] sm:rounded-[28px] ${
              isAddOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-6 scale-[0.98] opacity-0"
            }`}
          >
            <div className="shrink-0 border-b border-[#EEF2F6] px-4 py-4 sm:px-5 sm:py-5 md:px-6">
              <div className="mb-3 flex justify-center sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-[#D9E2EC]" />
              </div>

              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] sm:h-[46px] sm:w-[46px]">
                    <Package2 size={20} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-[22px]">
                      Add Stock Item
                    </h2>
                    <p className="mt-1 text-[12px] font-medium text-[#64748B] sm:text-[14px]">
                      Fill the stock details to create a new inventory entry
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] border border-[#E2E8F0] bg-white text-[#475569] transition-all duration-200 hover:bg-[#F8FAFC] sm:h-[40px] sm:w-[40px]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleAddItem}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Item Name"
                    value={form.item}
                    onChange={handleInputChange("item")}
                    placeholder="Enter item name"
                    required
                  />

                  <Field
                    label="Category"
                    value={form.category}
                    onChange={handleInputChange("category")}
                    placeholder="Enter category"
                  />

                  <Field
                    label="HSN"
                    value={form.hsn}
                    onChange={handleInputChange("hsn")}
                    placeholder="Enter HSN code"
                  />

                  <Field
                    label="GRN"
                    value={form.grn}
                    onChange={handleInputChange("grn")}
                    placeholder="Enter GRN number"
                  />

                  <Field
                    label="Purchase Order"
                    value={form.purchaseOrder}
                    onChange={handleInputChange("purchaseOrder")}
                    placeholder="Enter PO number"
                  />

                  <div className="hidden sm:block" />

                  <Field
                    label="Quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleInputChange("quantity")}
                    placeholder="Enter quantity"
                    required
                  />

                  <Field
                    label="Rate"
                    type="number"
                    value={form.rate}
                    onChange={handleInputChange("rate")}
                    placeholder="Enter rate"
                    required
                  />
                </div>

                <div className="mt-5 rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#64748B]">
                        Estimated Value
                      </p>
                      <h3 className="mt-1 break-words text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-[24px]">
                        {formatCurrency(estimatedValue)}
                      </h3>
                    </div>

                    <div className="text-[12px] font-medium text-[#94A3B8] sm:text-right">
                      Final value will be calculated by backend
                    </div>
                  </div>
                </div>

                {submitError ? (
                  <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                    {submitError}
                  </div>
                ) : null}

                {submitSuccess ? (
                  <div className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-700">
                    {submitSuccess}
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-[#EEF2F6] bg-white px-4 py-4 sm:px-5 sm:py-5 md:px-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-[48px] w-full items-center justify-center rounded-[14px] border border-[#D9E2EC] bg-white px-5 text-[14px] font-semibold text-[#334155] transition-all duration-200 hover:bg-[#F8FAFC] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#0F172A] px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#111C33] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add Stock
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155]">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-[48px] w-full rounded-[14px] border border-[#D9E2EC] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#CBD5E1] focus:ring-4 focus:ring-[#E2E8F0]"
      />
    </label>
  );
}