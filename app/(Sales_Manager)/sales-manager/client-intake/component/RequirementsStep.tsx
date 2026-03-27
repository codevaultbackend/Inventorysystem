"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ArrowRight, Box, PackagePlus, Trash2 } from "lucide-react";
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
  unit: "",
  hsn: "",
});

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
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
  const [errors, setErrors] = useState<Record<string, ProductErrors>>({});
  const [formError, setFormError] = useState("");

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

    setErrors(nextErrors);

    if (hasError) {
      setFormError("Please fill all required product details correctly.");
    } else {
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

  const totalAmount = useMemo(() => total, [total]);

  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white">
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[20px] font-semibold text-[#111827]">
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
            const itemErrors = errors[item.id] || {};

            return (
              <div
                key={item.id}
                className="rounded-[14px] border border-[#E5E7EB] bg-white p-4"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        Unit Price ($) <span className="text-[#DC2626]">*</span>
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

                <div className="mt-4 rounded-[10px] bg-[#F9FAFB] px-3 py-3 text-[13px] text-[#4B5563]">
                  Subtotal:{" "}
                  <span className="font-semibold text-[#111827]">
                    ${currency(itemSubtotal)}
                  </span>
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

        <div className="mt-5 rounded-[12px] bg-[#F4F8FF] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-semibold text-[#111827]">
              Total Amount:
            </span>
            <span className="text-[20px] font-bold text-[#2563EB]">
              ${currency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#EEF2F6] pt-4 sm:flex-row sm:items-center sm:justify-end">
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
    </div>
  );
}