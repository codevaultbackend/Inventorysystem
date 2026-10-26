"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  X,
  Package2,
  Loader2,
  Upload,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import HierarchyTable from "../../Components/HierarchyTable";
import { useAuth } from "@/app/context/AuthContext";
import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
  slugifyText,
} from "@/app/lib/inventoryDashboardApi";

// ✅ AUTO-FILL DATA IMPORT
import itemMasterData from "@/app/data/item-master.json";

// =========================================================
// AUTO-FILL LOOKUP
// =========================================================

const ITEM_LOOKUP = itemMasterData as Record<string, string[]>;

// IMPORTANT: Ye order JSON array ke index ke saath match karta hai.
// Isko change mat karo, warna values galat field me chali jayengi.
const ITEM_FIELD_ORDER = [
  "category",
  "sub_category",
  "item_code",
  "color",
  "type",
  "size",
  "unit",
  "brand",
  "hsn",
  "standard",
  "voltage",
  "description",
] as const;

type ItemFieldKey = (typeof ITEM_FIELD_ORDER)[number];

function getItemDetails(
  itemName: string
): Partial<Record<ItemFieldKey, string>> | null {
  if (!itemName) return null;

  const arr = ITEM_LOOKUP[itemName];

  if (!arr) return null;

  const result: Partial<Record<ItemFieldKey, string>> = {};

  ITEM_FIELD_ORDER.forEach((key, index) => {
    const val = arr[index];

    if (val && val.trim()) {
      result[key] = val.trim();
    }
  });

  return result;
}

// =========================================================
// TYPES
// =========================================================

type AddItemForm = {
  item: string;
  customItem: string;
  category: string;
  customCategory: string;
  customColor: string;
  customUnit: string;
  sub_category: string;
  hsn: string;
  grn: string;
  purchaseOrder: string;
  quantity: string;
  rate: string;
  batch_no: string;
  sku: string;
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

const MASTER_ITEM_NAMES = Object.keys(ITEM_LOOKUP);

const MASTER_CATEGORIES = Array.from(
  new Set(
    Object.values(ITEM_LOOKUP)
      .map((arr) => arr[0])
      .filter(Boolean)
  )
).sort();

const MASTER_COLOURS = [
  "Black",
  "Blue",
  "Brown",
  "GI / Silver",
  "Green",
  "Green/Yellow",
  "Grey",
  "Natural",
  "Red",
  "Tinned Copper",
  "White",
  "White / Grey",
  "Yellow",
  "Zinc Plated",
];

const MASTER_UNITS = ["Kg", "Kg/Ltr", "Meter", "Meters", "Nos.", "Roll", "Sheet/Roll"];

const initialForm: AddItemForm = {
  item: "",
  customItem: "",
  category: "",
  customCategory: "",
  customColor: "",
  customUnit: "",
  sub_category: "",
  hsn: "",
  grn: "",
  purchaseOrder: "",
  quantity: "",
  rate: "",
  batch_no: "",
  sku: "",
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
  gst_percent: "",
  rack_no: "",
  location: "",
  min_stock_level: "0",
  expiry_date: "",
  warranty_months: "0",
  status: "GOOD",
};

// =========================================================
// SELECT FIELD
// =========================================================

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (
    e:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
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
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="h-[50px] w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition-all duration-200 focus:border-[#CBD5E1] focus:ring-4 focus:ring-[#E2E8F0]"
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

// =========================================================
// FILTERABLE SELECT
// =========================================================

type FilterableSelectProps = {
  label: string;
  value: string;
  onSelectValue: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
};

function FilterableSelect({
  label,
  value,
  onSelectValue,
  options,
  placeholder = "Select or type...",
  required = false,
}: FilterableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const uniqueOptions = Array.from(
      new Set(
        options
          .filter(Boolean)
          .map((option) => option.trim())
          .filter((option) => option && option.toLowerCase() !== "na")
      )
    );

    const filtered = uniqueOptions
      .filter((option) => {
        if (option.toLowerCase() === "others") return false;
        if (!keyword) return true;
        return option.toLowerCase().includes(keyword);
      })
      .sort((a, b) => a.localeCompare(b));

    filtered.push("Others");

    return filtered;
  }, [options, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: string) => {
    onSelectValue(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  return (
    <div className="relative block" ref={dropdownRef}>
      <label className="mb-2 block text-[13px] font-semibold text-[#334155]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={(e) => {
            e.currentTarget.select();
            setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="h-[50px] w-full rounded-2xl border border-[#E2E8F0] bg-white pl-4 pr-10 text-[14px] font-medium text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#CBD5E1] focus:ring-4 focus:ring-[#E2E8F0]"
        />
        <button
          type="button"
          aria-label={`Toggle ${label} options`}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#64748B]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-[240px] w-full overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white py-2 shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2.5 text-[13px] text-[#94A3B8]">
              No results. Type to add custom.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleOptionSelect(option)}
                className={`cursor-pointer px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-[#F8FAFC] ${
                  option === "Others"
                    ? "font-semibold text-blue-600 hover:bg-blue-50"
                    : "text-[#0F172A]"
                }`}
              >
                {option === "Others" ? "Others (Add New)" : option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

const STOCK_SHEET_UPLOAD_ENDPOINT = "/combine/bulk-upload";

export default function InventoryBranchPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBranchDetails = async (showFullLoader = true) => {
    try {
      if (showFullLoader) setLoading(true);
      else setTableLoading(true);

      setError("");

      if (!branchId) throw new Error("Branch ID not found");

      const cacheKey = `inventory-branch-${branchId}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached && showFullLoader) {
        try {
          setData(JSON.parse(cached));
        } catch {}
      }

      const res = await inventoryDashboardApi.get(
        `/combine/dashboard/branch-Id/${encodeURIComponent(branchId)}`
      );

      if (res.data?.success) {
        setData(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
      } else {
        throw new Error(res.data?.message || "Failed to fetch");
      }
    } catch (err: any) {
      console.error(err);

      if (err?.response?.status === 401) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && branchId) {
      fetchBranchDetails();
    }
  }, [branchId, authLoading]);

  const existingItemNames = MASTER_ITEM_NAMES;
  const existingCategories = MASTER_CATEGORIES;
  const existingColours = MASTER_COLOURS;
  const existingUnits = MASTER_UNITS;

  const itemRows = useMemo(() => {
    try {
      const raw = Array.isArray(data?.allItems)
        ? data.allItems
        : Array.isArray(data?.items)
        ? data.items
        : [];

      return raw
        .map((item: any) => {
          const itemDescription =
            item?.item_description?.trim() ||
            item?.description?.trim() ||
            item?.item ||
            item?.name ||
            "NA";

          const itemName =
            item?.item ||
            item?.itemName ||
            item?.name ||
            itemDescription;

          const currentStock = toNumber(
            item?.currentStock || item?.stock || item?.quantity || 0
          );
          const rate = toNumber(item?.rate || 0);
          const totalValue = toNumber(
            item?.value || item?.totalValue || currentStock * rate
          );

          return {
            itemName,
            itemDescription,
            category: item?.category || "NA",
            totalQty: currentStock,
            totalValue,
            slugItemName: slugifyText(itemName),
            rawItem: item,
          };
        })
        .filter((item: any) => {
          if (!search.trim()) return true;
          const keyword = search.toLowerCase();
          return (
            item.itemName?.toLowerCase()?.includes(keyword) ||
            item.itemDescription?.toLowerCase()?.includes(keyword) ||
            item.category?.toLowerCase()?.includes(keyword)
          );
        });
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [data, search]);

  const estimatedValue = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);
    return Number((quantity * rate).toFixed(2));
  }, [form.quantity, form.rate]);

  const handleInputChange =
    (field: keyof AddItemForm) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      setSubmitError("");
      setSubmitSuccess("");
      setAutoFilledFields((prev) => prev.filter((f) => f !== field));
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // ✅ AUTO-FILL — sirf RENDERED fields (8 fields)
  const handleItemSelected = (itemName: string) => {
    setSubmitError("");
    setSubmitSuccess("");

    if (itemName === "Others") {
      setForm((prev) => ({ ...prev, item: "Others" }));
      setAutoFilledFields([]);
      return;
    }

    const details = getItemDetails(itemName);

    if (!details) {
      setForm((prev) => ({ ...prev, item: itemName }));
      setAutoFilledFields([]);
      return;
    }

    const filled: string[] = [];

    setForm((prev) => {
      const next = { ...prev, item: itemName };

      if (details.category) {
        next.category = details.category;
        filled.push("Category");
      }

      if (details.item_code) {
        next.item_code = details.item_code;
        filled.push("Item Code");
      }

      if (details.color) {
        next.color = details.color;
        filled.push("Colour");
      }

      if (details.type) {
        next.type = details.type;
        filled.push("Type");
      }

      if (details.size) {
        next.size = details.size;
        filled.push("Size");
      }

      if (details.unit) {
        next.unit = details.unit;
        filled.push("Unit");
      }

      if (details.brand) {
        next.brand = details.brand;
        filled.push("Brand");
      }

      if (details.hsn) {
        next.hsn = details.hsn;
        filled.push("HSN");
      }

      return next;
    });

    setAutoFilledFields(filled);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsAddOpen(false);
    setSubmitError("");
    setSubmitSuccess("");
    setAutoFilledFields([]);
    setForm(initialForm);
  };

  const validateForm = () => {
    const finalItemName =
      form.item === "Others" ? form.customItem : form.item;

    if (!finalItemName || !finalItemName.trim()) {
      return "Item is required";
    }

    if (form.item === "Others" && !form.customItem.trim()) {
      return "Custom Item Name is required";
    }

    if (form.category === "Others" && !form.customCategory.trim()) {
      return "Custom Category is required";
    }

    if (form.color === "Others" && !form.customColor.trim()) {
      return "Custom Colour is required";
    }

    if (form.unit === "Others" && !form.customUnit.trim()) {
      return "Custom Unit is required";
    }

    if (!form.quantity.trim()) return "Quantity is required";
    if (!form.rate.trim()) return "Rate is required";

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

      const finalItem = (
        form.item === "Others" ? form.customItem : form.item
      ).trim();

      const finalCategory = (
        form.category === "Others" ? form.customCategory : form.category
      ).trim();

      const finalColor = (
        form.color === "Others" ? form.customColor : form.color
      ).trim();

      const finalUnit = (
        form.unit === "Others" ? form.customUnit : form.unit
      ).trim();

      const payload = {
        item: finalItem,
        category: finalCategory,
        sub_category: form.sub_category.trim(),
        quantity: Number(form.quantity),
        rate: Number(form.rate),
        hsn: form.hsn.trim(),
        grn: form.grn.trim(),
        po_number: form.purchaseOrder.trim(),
        batch_no: form.batch_no.trim(),
        sku: form.sku.trim(),
        brand: form.brand.trim(),
        type: form.type.trim(),
        size: form.size.trim(),
        color: finalColor,
        bundle_size: form.bundle_size.trim(),
        unit: finalUnit,
        model_no: form.model_no.trim(),
        serial_no: form.serial_no.trim(),
        item_description: form.item_description.trim(),
        item_code: form.item_code.trim(),
        rack_no: form.rack_no.trim(),
        location: form.location.trim(),
        min_stock_level: Number(form.min_stock_level || 0),
        expiry_date: form.expiry_date || null,
        warranty_months: Number(form.warranty_months || 0),
        status: form.status.trim() || "GOOD",
      };

      const res = await inventoryDashboardApi.post(
        "/combine/add-stock",
        payload
      );

      if (res.data?.success) {
        setSubmitSuccess("Stock item added successfully");
        await fetchBranchDetails(false);
        setTimeout(() => closeModal(), 800);
      } else {
        throw new Error(res.data?.message || "Failed to add stock");
      }
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add stock"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSheet = async () => {
    if (!selectedSheet) {
      setUploadError("Please select sheet");
      return;
    }

    try {
      setUploadingSheet(true);
      setUploadError("");
      setUploadSuccess("");

      const formData = new FormData();
      formData.append("file", selectedSheet);

      const res = await inventoryDashboardApi.post(
        STOCK_SHEET_UPLOAD_ENDPOINT,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data?.success) {
        setUploadSuccess(`Upload success • ${res.data?.batch_no}`);
        await fetchBranchDetails(false);
        setTimeout(() => {
          setIsUploadOpen(false);
          setSelectedSheet(null);
          setUploadSuccess("");
        }, 1200);
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err: any) {
      setUploadError(
        err?.response?.data?.message || err?.message || "Upload failed"
      );
    } finally {
      setUploadingSheet(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-[#0F172A]" size={22} />
          <span className="text-[15px] font-semibold text-[#0F172A]">
            Loading inventory...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F7F9FB]">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm">
            <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#0F172A]">
                    Inventory Items
                  </h1>
                  <p className="mt-1 text-[14px] font-medium text-[#64748B]">
                    Item wise inventory summary
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-5 text-[14px] font-semibold text-[#334155] transition-all hover:bg-[#F8FAFC]"
                  >
                    <Upload size={17} />
                    Upload Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#0F172A] px-5 text-[14px] font-semibold text-white transition-all hover:opacity-95"
                  >
                    <Plus size={17} />
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              {tableLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                  <Loader2 className="animate-spin text-[#0F172A]" size={22} />
                </div>
              )}

              <HierarchyTable
                title=""
                subtitle=""
                data={Array.isArray(itemRows) ? itemRows : []}
                getViewHref={(row) =>
                  `/inventory-manager/all-stocks/${encodeURIComponent(
                    row.slugItemName
                  )}`
                }
                columns={[
                  {
                    key: "itemDescription",
                    title: "Item Description",
                    render: (row) => (
                      <div className="min-w-[180px]">
                        <p className="text-[14px] font-semibold text-[#0F172A]">
                          {row.itemDescription}
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-[#64748B]">
                          {row.category}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "category",
                    title: "Category",
                    render: (row) => (
                      <span className="inline-flex rounded-full bg-[#F1F5F9] px-3 py-1 text-[12px] font-semibold text-[#334155]">
                        {row.category}
                      </span>
                    ),
                  },
                  {
                    key: "totalQty",
                    title: "Total Qty",
                    render: (row) => (
                      <span className="text-[14px] font-semibold text-[#0F172A]">
                        {formatNumber(toNumber(row.totalQty))}
                      </span>
                    ),
                  },
                  {
                    key: "totalValue",
                    title: "Total Value",
                    render: (row) => (
                      <span className="text-[14px] font-semibold text-[#0F172A]">
                        {formatCurrency(toNumber(row.totalValue))}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ ADD ITEM MODAL ============ */}
      <div
        className={`fixed inset-0 z-[120] transition-all duration-300 ${
          isAddOpen
            ? "pointer-events-auto bg-black/40 backdrop-blur-[3px]"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeModal}
      >
        <div className="flex min-h-screen items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex h-[100dvh] w-full transform flex-col overflow-hidden bg-white transition-all duration-300 sm:h-auto sm:max-h-[94vh] sm:max-w-[900px] sm:rounded-[30px] ${
              isAddOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#EEF2F6] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#F8FAFC]">
                  <Package2 size={24} className="text-[#0F172A]" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-[#0F172A]">
                    Add Stock Item
                  </h2>
                  <p className="mt-1 text-[13px] font-medium text-[#64748B]">
                    Select item — fields auto-fill ho jayenge
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-[#E2E8F0]"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddItem}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {/* ✅ AUTO-FILL BANNER */}
                {autoFilledFields.length > 0 && (
                  <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <Sparkles
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <div>
                      <p className="text-[13px] font-semibold text-emerald-800">
                        Auto-filled {autoFilledFields.length} field(s) from item master
                      </p>
                      <p className="mt-1 text-[12px] text-emerald-700">
                        {autoFilledFields.join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* ITEM SELECT — triggers auto-fill */}
                  <FilterableSelect
                    label="Item Name"
                    value={form.item}
                    onSelectValue={handleItemSelected}
                    options={existingItemNames}
                    placeholder="Search or select Item..."
                    required
                  />

                  {form.item === "Others" && (
                    <Field
                      label="Enter New Item Name"
                      value={form.customItem}
                      onChange={handleInputChange("customItem")}
                      placeholder="e.g. CUSTOM LED BULB"
                      required
                    />
                  )}

                  <FilterableSelect
                    label="Category"
                    value={form.category}
                    onSelectValue={(val) => {
                      setSubmitError("");
                      setForm((prev) => ({ ...prev, category: val }));
                    }}
                    options={existingCategories}
                    placeholder="Search or select Category..."
                  />

                  {form.category === "Others" && (
                    <Field
                      label="Enter New Category"
                      value={form.customCategory}
                      onChange={handleInputChange("customCategory")}
                      placeholder="e.g. Smart Hardware"
                      required
                    />
                  )}

                  <Field
                    label="HSN"
                    value={form.hsn}
                    onChange={handleInputChange("hsn")}
                    placeholder="85395000"
                  />

                  <Field
                    label="GRN"
                    value={form.grn}
                    onChange={handleInputChange("grn")}
                    placeholder="GRN-2026"
                  />

                  <Field
                    label="Purchase Order"
                    value={form.purchaseOrder}
                    onChange={handleInputChange("purchaseOrder")}
                    placeholder="PO-4587"
                  />

                  <Field
                    label="Batch No"
                    value={form.batch_no}
                    onChange={handleInputChange("batch_no")}
                    placeholder="BULK-0001"
                  />

                  <Field
                    label="SKU"
                    value={form.sku}
                    onChange={handleInputChange("sku")}
                    placeholder="SKU-1001"
                  />

                  <Field
                    label="Brand"
                    value={form.brand}
                    onChange={handleInputChange("brand")}
                    placeholder="PHILIPS"
                  />

                  <Field
                    label="Type"
                    value={form.type}
                    onChange={handleInputChange("type")}
                    placeholder="LED"
                  />

                  <Field
                    label="Size"
                    value={form.size}
                    onChange={handleInputChange("size")}
                    placeholder="12 Watt"
                  />

                  <FilterableSelect
                    label="Colour"
                    value={form.color}
                    onSelectValue={(val) => {
                      setSubmitError("");
                      setForm((prev) => ({ ...prev, color: val }));
                    }}
                    options={existingColours}
                    placeholder="Search or select Colour..."
                  />

                  {form.color === "Others" && (
                    <Field
                      label="Enter New Colour"
                      value={form.customColor}
                      onChange={handleInputChange("customColor")}
                      placeholder="e.g. Cool White"
                      required
                    />
                  )}

                  <Field
                    label="Bundle Size"
                    value={form.bundle_size}
                    onChange={handleInputChange("bundle_size")}
                    placeholder="1"
                  />

                  <FilterableSelect
                    label="Unit"
                    value={form.unit}
                    onSelectValue={(val) => {
                      setSubmitError("");
                      setForm((prev) => ({ ...prev, unit: val }));
                    }}
                    options={existingUnits}
                    placeholder="Search or select Unit..."
                  />

                  {form.unit === "Others" && (
                    <Field
                      label="Enter Custom Unit"
                      value={form.customUnit}
                      onChange={handleInputChange("customUnit")}
                      placeholder="e.g. PCS"
                      required
                    />
                  )}

                  <Field
                    label="Item Code"
                    value={form.item_code}
                    onChange={handleInputChange("item_code")}
                    placeholder="ITEM-1001"
                  />

                  <Field
                    label="Quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleInputChange("quantity")}
                    placeholder="50"
                    required
                  />

                  <Field
                    label="Rate"
                    type="number"
                    value={form.rate}
                    onChange={handleInputChange("rate")}
                    placeholder="120"
                    required
                  />

                  <Field
                    label="Warranty Months"
                    type="number"
                    value={form.warranty_months}
                    onChange={handleInputChange("warranty_months")}
                    placeholder="12"
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
                </div>

                <div className="mt-5 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                  <p className="text-[13px] font-medium text-[#64748B]">
                    Estimated Value
                  </p>
                  <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[#0F172A]">
                    {formatCurrency(estimatedValue)}
                  </h3>
                </div>

                {submitError && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-semibold text-emerald-700">
                    <CheckCircle2 size={18} />
                    {submitSuccess}
                  </div>
                )}
              </div>

              <div className="border-t border-[#EEF2F6] bg-white px-5 py-5 sm:px-7">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-[50px] rounded-2xl border border-[#E2E8F0] px-5 text-[14px] font-semibold text-[#334155]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-[#0F172A] px-6 text-[14px] font-semibold text-white disabled:opacity-70"
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

      {/* ============ UPLOAD MODAL ============ */}
      <div
        className={`fixed inset-0 z-[130] transition-all duration-300 ${
          isUploadOpen
            ? "pointer-events-auto bg-black/40 backdrop-blur-[3px]"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => !uploadingSheet && setIsUploadOpen(false)}
      >
        <div className="flex min-h-screen items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full transform bg-white transition-all duration-300 sm:max-w-[560px] sm:rounded-[30px] ${
              isUploadOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="border-b border-[#EEF2F6] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#F8FAFC]">
                  <FileSpreadsheet size={24} className="text-[#0F172A]" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-[#0F172A]">
                    Upload Inventory Sheet
                  </h2>
                  <p className="mt-1 text-[13px] font-medium text-[#64748B]">
                    Upload XLSX or CSV stock sheet
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-7">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedSheet(file);
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[180px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] transition-all hover:bg-[#F1F5F9]"
              >
                <Upload size={34} className="text-[#64748B]" />
                <p className="mt-4 text-[15px] font-semibold text-[#0F172A]">
                  Click to upload stock sheet
                </p>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  Supports .xlsx, .xls, .csv
                </p>
              </button>

              {selectedSheet && (
                <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[14px] font-semibold text-[#0F172A]">
                    {selectedSheet.name}
                  </p>
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    {(selectedSheet.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-semibold text-emerald-700">
                  <CheckCircle2 size={18} />
                  {uploadSuccess}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={() => !uploadingSheet && setIsUploadOpen(false)}
                className="h-[50px] rounded-2xl border border-[#E2E8F0] px-5 text-[14px] font-semibold text-[#334155]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uploadingSheet || !selectedSheet}
                onClick={handleUploadSheet}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-[#0F172A] px-6 text-[14px] font-semibold text-white disabled:opacity-60"
              >
                {uploadingSheet ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Sheet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// =========================================================
// FIELD COMPONENT
// =========================================================

type FieldProps = {
  label: string;
  value: string;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
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
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-[50px] w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#CBD5E1] focus:ring-4 focus:ring-[#E2E8F0]"
      />
    </label>
  );
}