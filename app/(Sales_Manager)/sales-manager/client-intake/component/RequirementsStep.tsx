"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ArrowRight,
  Box,
  CalendarDays,
  FileText,
  IndianRupee,
  PackagePlus,
  Percent,
  Trash2,
} from "lucide-react";
import type { Product } from "./ClientIntakePage";

type Props = {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  total: number;
  onCreateQuotation: () => Promise<void>;
  back: () => void;
  loading: boolean;
  apiError: string;
};

type ProductErrors = {
  name?: string;
  quantity?: string;
  price?: string;
};

const createProduct = (): Product => ({
  id:
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  quantity: "1",
  price: "0",
  specs: "",
  unit: "pcs",
  hsn: "",
});

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function RequirementsStep({
  products,
  setProducts,
  total,
  onCreateQuotation,
  back,
  loading,
  apiError,
}: Props) {
  const [gstPercent, setGstPercent] = useState("18");
  const [validTill, setValidTill] = useState("");
  const [errors, setErrors] = useState<Record<string, ProductErrors>>({});
  const [formError, setFormError] = useState("");

  const subtotal = useMemo(() => total, [total]);

  const gstAmount = useMemo(() => {
    const gst = Number(gstPercent || 0);
    return subtotal * (gst / 100);
  }, [subtotal, gstPercent]);

  const grandTotal = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);

  const handleProductChange = (
    id: string,
    field: keyof Product,
    value: string
  ) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    setErrors((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]:
          field === "name" || field === "quantity" || field === "price"
            ? ""
            : prev[id]?.[field as keyof ProductErrors],
      },
    }));

    if (formError) setFormError("");
  };

  const addProduct = () => {
    setProducts((prev) => [...prev, createProduct()]);
  };

  const removeProduct = (id: string) => {
    if (products.length === 1) return;

    setProducts((prev) => prev.filter((item) => item.id !== id));

    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, ProductErrors> = {};
    let hasError = false;

    if (!products.length) {
      setFormError("Please add at least one product.");
      return false;
    }

    products.forEach((item) => {
      const itemErrors: ProductErrors = {};

      if (!item.name.trim()) {
        itemErrors.name = "Product name is required.";
        hasError = true;
      }

      if (!item.quantity.trim()) {
        itemErrors.quantity = "Quantity is required.";
        hasError = true;
      } else if (Number(item.quantity) <= 0 || Number.isNaN(Number(item.quantity))) {
        itemErrors.quantity = "Enter a valid quantity.";
        hasError = true;
      }

      if (!item.price.trim()) {
        itemErrors.price = "Unit price is required.";
        hasError = true;
      } else if (Number(item.price) < 0 || Number.isNaN(Number(item.price))) {
        itemErrors.price = "Enter a valid unit price.";
        hasError = true;
      }

      if (Object.keys(itemErrors).length > 0) {
        nextErrors[item.id] = itemErrors;
      }
    });

    if (Number(gstPercent) < 0 || Number.isNaN(Number(gstPercent))) {
      setFormError("GST percent must be a valid number.");
      hasError = true;
    }

    setErrors(nextErrors);

    if (!hasError) {
      setFormError("");
    }

    return !hasError;
  };

  const handleCreate = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      await onCreateQuotation();
    } catch (error) {
      console.error("Create quotation failed:", error);
    }
  };

  return (
    <div className="rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div>
          <h3 className="text-[20px] font-semibold leading-none text-[#111827]">
            Product Requirements
          </h3>
          <p className="mt-1 text-[13px] font-normal text-[#6B7280]">
            Add products, quantities, pricing, and quotation details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
          <div className="min-w-[170px]">
            <label className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-[#374151]">
              <Percent size={14} />
              GST %
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              className="h-[42px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
              placeholder="18"
            />
          </div>

          <div className="min-w-[170px]">
            <label className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-[#374151]">
              <CalendarDays size={14} />
              Valid Till
            </label>
            <input
              type="date"
              value={validTill}
              onChange={(e) => setValidTill(e.target.value)}
              className="h-[42px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[14px] font-medium text-[#111827]">
            Product Requirements
          </div>

          <button
            type="button"
            onClick={addProduct}
            className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 text-[14px] font-medium text-white transition hover:bg-[#1D4ED8]"
          >
            <PackagePlus size={16} />
            Add Product
          </button>
        </div>

        <div className="space-y-4">
          {products.map((item, index) => {
            const qty = Number(item.quantity || 0);
            const price = Number(item.price || 0);
            const itemSubtotal = qty * price;
            const itemGst = itemSubtotal * (Number(gstPercent || 0) / 100);
            const itemTotal = itemSubtotal + itemGst;
            const itemErrors = errors[item.id] || {};

            return (
              <div
                key={item.id}
                className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-3 border-b border-[#EEF2F6] pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Box size={18} className="text-[#6B7280]" />
                    <h4 className="text-[18px] font-semibold text-[#111827]">
                      Product {index + 1}
                    </h4>
                  </div>

                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(item.id)}
                      className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 text-[13px] font-medium text-[#B91C1C] transition hover:bg-[#FEE2E2]"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                      Product Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleProductChange(item.id, "name", e.target.value)
                      }
                      placeholder="e.g., Industrial Pump Model X200"
                      className={`h-[44px] w-full rounded-[12px] border bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:ring-4 ${
                        itemErrors.name
                          ? "border-[#FCA5A5] focus:border-[#DC2626] focus:ring-[#FEE2E2]"
                          : "border-[#D1D5DB] focus:border-[#2563EB] focus:ring-[#DBEAFE]"
                      }`}
                    />
                    {itemErrors.name ? (
                      <p className="mt-1 text-[12px] text-[#DC2626]">
                        {itemErrors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                        Quantity <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleProductChange(item.id, "quantity", e.target.value)
                        }
                        className={`h-[44px] w-full rounded-[12px] border bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:ring-4 ${
                          itemErrors.quantity
                            ? "border-[#FCA5A5] focus:border-[#DC2626] focus:ring-[#FEE2E2]"
                            : "border-[#D1D5DB] focus:border-[#2563EB] focus:ring-[#DBEAFE]"
                        }`}
                      />
                      {itemErrors.quantity ? (
                        <p className="mt-1 text-[12px] text-[#DC2626]">
                          {itemErrors.quantity}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                        Unit Price (₹) <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          handleProductChange(item.id, "price", e.target.value)
                        }
                        className={`h-[44px] w-full rounded-[12px] border bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:ring-4 ${
                          itemErrors.price
                            ? "border-[#FCA5A5] focus:border-[#DC2626] focus:ring-[#FEE2E2]"
                            : "border-[#D1D5DB] focus:border-[#2563EB] focus:ring-[#DBEAFE]"
                        }`}
                      />
                      {itemErrors.price ? (
                        <p className="mt-1 text-[12px] text-[#DC2626]">
                          {itemErrors.price}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit ?? ""}
                        onChange={(e) =>
                          handleProductChange(item.id, "unit", e.target.value)
                        }
                        placeholder="pcs"
                        className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                        HSN Code
                      </label>
                      <input
                        type="text"
                        value={item.hsn ?? ""}
                        onChange={(e) =>
                          handleProductChange(item.id, "hsn", e.target.value)
                        }
                        placeholder="8471"
                        className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                      Specifications
                    </label>
                    <textarea
                      value={item.specs}
                      onChange={(e) =>
                        handleProductChange(item.id, "specs", e.target.value)
                      }
                      rows={3}
                      placeholder="Enter product specifications, features, or requirements"
                      className="w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 py-3 text-[14px] text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-[12px] bg-[#F9FAFB] p-3">
                  <div className="grid grid-cols-1 gap-2 text-[13px] text-[#4B5563] sm:grid-cols-3">
                    <div>
                      Subtotal:{" "}
                      <span className="font-semibold text-[#111827]">
                        ₹{currency(itemSubtotal)}
                      </span>
                    </div>
                    <div>
                      GST:{" "}
                      <span className="font-semibold text-[#111827]">
                        ₹{currency(itemGst)}
                      </span>
                    </div>
                    <div>
                      Amount:{" "}
                      <span className="font-semibold text-[#111827]">
                        ₹{currency(itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {formError ? (
          <div className="mt-5 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
            {formError}
          </div>
        ) : null}

        {apiError ? (
          <div className="mt-5 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
            {apiError}
          </div>
        ) : null}

        <div className="mt-5 rounded-[14px] border border-[#DBEAFE] bg-[#EFF6FF] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-[#111827]">
            <FileText size={18} className="text-[#2563EB]" />
            Quotation Summary
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[12px] bg-white px-4 py-3">
              <div className="text-[12px] text-[#6B7280]">Subtotal</div>
              <div className="mt-1 text-[18px] font-semibold text-[#111827]">
                ₹{currency(subtotal)}
              </div>
            </div>

            <div className="rounded-[12px] bg-white px-4 py-3">
              <div className="text-[12px] text-[#6B7280]">GST ({gstPercent || 0}%)</div>
              <div className="mt-1 text-[18px] font-semibold text-[#111827]">
                ₹{currency(gstAmount)}
              </div>
            </div>

            <div className="rounded-[12px] bg-white px-4 py-3">
              <div className="text-[12px] text-[#6B7280]">Valid Till</div>
              <div className="mt-1 text-[16px] font-semibold text-[#111827]">
                {validTill || "Not set"}
              </div>
            </div>

            <div className="rounded-[12px] bg-[#2563EB] px-4 py-3 text-white">
              <div className="flex items-center gap-1 text-[12px] text-white/80">
                <IndianRupee size={14} />
                Total Amount
              </div>
              <div className="mt-1 text-[22px] font-semibold">
                ₹{currency(grandTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] px-4 py-4 sm:px-5 sm:flex-row sm:items-center sm:justify-end lg:px-6">
        <button
          type="button"
          onClick={back}
          disabled={loading}
          className="h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white px-5 text-[14px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading || products.length === 0}
          className={`inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] px-5 text-[14px] font-medium text-white transition ${
            loading || products.length === 0
              ? "cursor-not-allowed bg-[#BFD0FB]"
              : "bg-[#2563EB] hover:bg-[#1D4ED8]"
          }`}
        >
          {loading ? "Creating Quotation..." : "Create Quotation"}
          {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}