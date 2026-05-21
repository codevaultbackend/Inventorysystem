"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  X,
  Package2,
  Loader2,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

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

  batch_no: string;
  sku: string;
  sub_category: string;
  brand: string;
  type: string;
  size: string;
  color: string;
  bundle_size: string;
  unit: string;
  model_no: string;
  serial_no: string;
  item_description: string;
  item_code: string;

  specification_grade: string;
  specification_strength: string;

  gst_percent: string;
  rack_no: string;
  location: string;
  min_stock_level: string;
  expiry_date: string;
  warranty_months: string;
  status: string;
};

const initialForm: AddItemForm = {
  item: "",
  category: "",
  hsn: "",
  grn: "",
  purchaseOrder: "",

  quantity: "",
  rate: "",

  batch_no: "",
  sku: "",
  sub_category: "",
  brand: "",
  type: "",
  size: "",
  color: "",
  bundle_size: "",
  unit: "PCS",
  model_no: "",
  serial_no: "",
  item_description: "",
  item_code: "",

  specification_grade: "",
  specification_strength: "",

  gst_percent: "18",
  rack_no: "",
  location: "",
  min_stock_level: "0",
  expiry_date: "",
  warranty_months: "0",
  status: "GOOD",
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
};

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155]">
        {label}{" "}
        {required ? (
          <span className="text-red-500">*</span>
        ) : null}
      </span>

      <select
        value={value}
        onChange={onChange}
        className="h-[48px] w-full rounded-[14px] border border-[#D9E2EC] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition-all duration-200 focus:border-[#CBD5E1] focus:ring-4 focus:ring-[#E2E8F0]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const STOCK_SHEET_UPLOAD_ENDPOINT = "/combine/bulk-upload";

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

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [uploadingSheet, setUploadingSheet] = useState(false);

  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [selectedSheet, setSelectedSheet] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const gstPercent = Number(form.gst_percent || 0);

  const baseAmount = quantity * rate;

  const gstAmount = (baseAmount * gstPercent) / 100;

  const finalAmount = baseAmount + gstAmount;

  return Number(finalAmount.toFixed(2));
}, [form.quantity, form.rate, form.gst_percent]);

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

  const closeUploadModal = () => {
    if (uploadingSheet) return;

    setIsUploadOpen(false);

    setUploadError("");
    setUploadSuccess("");

    setSelectedSheet(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!form.item.trim()) {
      return "Item name is required";
    }

    if (!form.quantity.trim()) {
      return "Quantity is required";
    }

    if (!form.rate.trim()) {
      return "Rate is required";
    }

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

        quantity: Number(form.quantity),

        rate: Number(form.rate),

        hsn: form.hsn.trim(),

        grn: form.grn.trim(),

        po_number: form.purchaseOrder.trim(),

        batch_no: form.batch_no.trim(),

        sku: form.sku.trim(),

        sub_category: form.sub_category.trim(),

        brand: form.brand.trim(),

        type: form.type.trim(),

        size: form.size.trim(),

        color: form.color.trim(),

        bundle_size: form.bundle_size.trim(),

        unit: form.unit.trim() || "PCS",

        model_no: form.model_no.trim(),

        serial_no: form.serial_no.trim(),

        item_description: form.item_description.trim(),

        item_code: form.item_code.trim(),

        specification:
          form.specification_grade || form.specification_strength
            ? {
              grade: form.specification_grade.trim(),
              strength: form.specification_strength.trim(),
            }
            : null,

        gst_percent: Number(form.gst_percent || 18),

        rack_no: form.rack_no.trim(),

        location: form.location.trim(),

        min_stock_level: Number(form.min_stock_level || 0),

        expiry_date: form.expiry_date || null,

        warranty_months: Number(form.warranty_months || 0),

        status: form.status.trim() || "GOOD",
      };

      const res = await inventoryDashboardApi.post(
        "combine/add-stock",
        payload
      );

      if (res.data?.success) {
        setSubmitSuccess(
          res.data?.message || "Stock item added successfully"
        );

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

  const handleSheetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    setUploadSuccess("");

    const file = e.target.files?.[0] || null;

    setSelectedSheet(file);
  };

  const handleSheetUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSheet) {
      setUploadError("Please select a sheet file first");
      return;
    }

    const lowerName = selectedSheet.name.toLowerCase();

    const isValidFile =
      lowerName.endsWith(".xlsx") ||
      lowerName.endsWith(".xls") ||
      lowerName.endsWith(".csv");

    if (!isValidFile) {
      setUploadError("Please upload a valid .xlsx, .xls, or .csv file");
      return;
    }

    try {
      setUploadingSheet(true);

      setUploadError("");
      setUploadSuccess("");

      const formData = new FormData();

      formData.append("file", selectedSheet);

      if (branchId) {
        formData.append("branchId", branchId);
      }

      if (stateName) {
        formData.append("state", stateName);
      }

      const res = await inventoryDashboardApi.post(
        STOCK_SHEET_UPLOAD_ENDPOINT,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.success) {
        setUploadSuccess(
          res.data?.message || "Stock sheet uploaded successfully"
        );

        await fetchBranchDetails();

        setTimeout(() => {
          closeUploadModal();
        }, 900);
      } else {
        throw new Error(res.data?.message || "Failed to upload stock sheet");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      setUploadError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload stock sheet"
      );
    } finally {
      setUploadingSheet(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F7F9FB]">
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

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  setUploadError("");
                  setUploadSuccess("");
                  setSelectedSheet(null);
                  setIsUploadOpen(true);
                }}
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[14px] border border-[#D9E2EC] bg-white px-4 text-[14px] font-semibold text-[#0F172A]"
              >
                <Upload size={18} />
                Upload Sheet
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmitError("");
                  setSubmitSuccess("");
                  setIsAddOpen(true);
                }}
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[14px] border border-[#D9E2EC] bg-[#0F172A] px-4 text-[14px] font-semibold text-white"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>
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

      {/* ADD MODAL */}

      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${isAddOpen
          ? "pointer-events-auto bg-[rgba(15,23,42,0.42)] backdrop-blur-[2px]"
          : "pointer-events-none bg-transparent"
          }`}
        onClick={closeModal}
      >
        <div className="flex min-h-[100dvh] items-end justify-center p-0 sm:items-center sm:p-4 md:p-6">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex h-[100dvh] w-full transform flex-col overflow-hidden rounded-t-[28px] border border-[#E2E8F0] bg-white transition-all duration-300 sm:h-auto sm:max-h-[92vh] sm:max-w-[760px] sm:rounded-[28px] ${isAddOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-6 scale-[0.98] opacity-0"
              }`}
          >
            <div className="border-b border-[#EEF2F6] px-4 py-4 sm:px-5 sm:py-5 md:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]">
                    <Package2 size={20} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[18px] font-semibold text-[#0F172A]">
                      Add Stock Item
                    </h2>

                    <p className="mt-1 text-[12px] font-medium text-[#64748B]">
                      Fill stock details
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[12px] border border-[#E2E8F0]"
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
                  />

                  <Field
                    label="GRN"
                    value={form.grn}
                    onChange={handleInputChange("grn")}
                  />

                  <Field
                    label="Purchase Order"
                    value={form.purchaseOrder}
                    onChange={handleInputChange("purchaseOrder")}
                  />

                  <Field
                    label="Batch No"
                    value={form.batch_no}
                    onChange={handleInputChange("batch_no")}
                  />

                  <Field
                    label="SKU"
                    value={form.sku}
                    onChange={handleInputChange("sku")}
                  />

                  <Field
                    label="Sub Category"
                    value={form.sub_category}
                    onChange={handleInputChange("sub_category")}
                  />

                  <Field
                    label="Brand"
                    value={form.brand}
                    onChange={handleInputChange("brand")}
                  />

                  <Field
                    label="Type"
                    value={form.type}
                    onChange={handleInputChange("type")}
                  />

                  <Field
                    label="Size"
                    value={form.size}
                    onChange={handleInputChange("size")}
                  />

                  <Field
                    label="Color"
                    value={form.color}
                    onChange={handleInputChange("color")}
                  />

                  <Field
                    label="Bundle Size"
                    value={form.bundle_size}
                    onChange={handleInputChange("bundle_size")}
                  />

                  <Field
                    label="Unit"
                    value={form.unit}
                    onChange={handleInputChange("unit")}
                  />

                  <Field
                    label="Model No"
                    value={form.model_no}
                    onChange={handleInputChange("model_no")}
                  />

                  <Field
                    label="Serial No"
                    value={form.serial_no}
                    onChange={handleInputChange("serial_no")}
                  />

                  <Field
                    label="Item Code"
                    value={form.item_code}
                    onChange={handleInputChange("item_code")}
                  />

                  <Field
                    label="Rack No"
                    value={form.rack_no}
                    onChange={handleInputChange("rack_no")}
                  />

                  <Field
                    label="Location"
                    value={form.location}
                    onChange={handleInputChange("location")}
                  />

                  <Field
                    label="GST %"
                    type="number"
                    value={form.gst_percent}
                    onChange={handleInputChange("gst_percent")}
                  />

                  <Field
                    label="Min Stock Level"
                    type="number"
                    value={form.min_stock_level}
                    onChange={handleInputChange("min_stock_level")}
                  />

                  <Field
                    label="Warranty Months"
                    type="number"
                    value={form.warranty_months}
                    onChange={handleInputChange("warranty_months")}
                  />

                  <Field
                    label="Expiry Date"
                    type="date"
                    value={form.expiry_date}
                    onChange={handleInputChange("expiry_date")}
                  />

                  <SelectField
                    label="Status"
                    value={form.status}
                    onChange={handleInputChange("status")}
                    options={[
                      "GOOD",
                      "LOW STOCK",
                      "OUT OF STOCK",
                      "DAMAGED",
                      "EXPIRED",
                    ]}
                  />

                  <Field
                    label="Quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleInputChange("quantity")}
                    required
                  />

                  <Field
                    label="Rate"
                    type="number"
                    value={form.rate}
                    onChange={handleInputChange("rate")}
                    required
                  />

                  <Field
                    label="Specification Grade"
                    value={form.specification_grade}
                    onChange={handleInputChange("specification_grade")}
                  />

                  <Field
                    label="Specification Strength"
                    value={form.specification_strength}
                    onChange={handleInputChange("specification_strength")}
                  />
                </div>

                <div className="mt-4">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-[#334155]">
                      Item Description
                    </span>

                    <textarea
                      value={form.item_description}
                      onChange={handleInputChange("item_description")}
                      rows={4}
                      className="w-full rounded-[14px] border border-[#D9E2EC] bg-white px-4 py-3 text-[14px] font-medium text-[#0F172A] outline-none"
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#64748B]">
                        Estimated Value
                      </p>

                      <h3 className="mt-1 text-[22px] font-semibold text-[#0F172A]">
                        {formatCurrency(estimatedValue)}
                      </h3>
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

              <div className="border-t border-[#EEF2F6] bg-white px-4 py-4 sm:px-5 sm:py-5 md:px-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-[48px] items-center justify-center rounded-[14px] border border-[#D9E2EC] bg-white px-5 text-[14px] font-semibold text-[#334155]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[14px] bg-[#0F172A] px-5 text-[14px] font-semibold text-white disabled:opacity-70"
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