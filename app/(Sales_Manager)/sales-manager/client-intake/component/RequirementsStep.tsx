"use client";

import {
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
  useEffect,
} from "react";

import { PackagePlus, Trash2, Loader2 } from "lucide-react";
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

type ItemList = {
  stock_id: number;
  product_name: string;
  category: string;
  available_qty: number;
  unit_price: number;
  total_value: number;
  hsn: string;
  status: string;
  branch_id: number;
  unit: string;
};

const createProduct = (): Product => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: "1",
  price: "0",
  specs: "",
  unit: "",
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
}: Props) {
  const [items, setItems] = useState<ItemList[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

 const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const [searchMap, setSearchMap] = useState<Record<string, string>>({});

  /* ================= Fetch ================= */

  const fetchItems = async () => {
    try {
      setItemsLoading(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("token")
          : null;

      const res = await fetch(
        `${BaseUrl}/sales/getitemlist`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      const data = await res.json();

      if (data?.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setItemsLoading(false);
    }
  };

  /* ================= Filter ================= */

  const getFilteredItems = (productId: string) => {
    const search = searchMap[productId] || "";

    if (!search) return items;

    return items.filter((item) =>
      item.product_name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  };

  /* ================= Select ================= */

  const handleSelectItem = (productId: string, item: ItemList) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              name: item.product_name,
              price: String(item.unit_price),
              hsn: item.hsn || "",
              unit: item.unit || "",
            }
          : p
      )
    );

    setOpenDropdown(null);

    // reset search only for that dropdown
    setSearchMap((prev) => ({
      ...prev,
      [productId]: "",
    }));
  };

  /* ================= Outside Click ================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.closest("[data-product-dropdown]")) return;

      setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= Handlers ================= */

  const handleChange = (
    id: string,
    field: keyof Product,
    value: string
  ) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addProduct = () =>
    setProducts((prev) => [...prev, createProduct()]);

  const removeProduct = (id: string) =>
    setProducts((prev) =>
      prev.length > 1
        ? prev.filter((item) => item.id !== id)
        : prev
    );

  /* ================= UI ================= */

  return (
    <div className="rounded-[30px] border border-[#E5E7EB] bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex justify-between mb-4">
        <h3 className="text-[18px] font-semibold">
          Product Requirements
        </h3>

        <button
          onClick={addProduct}
          className="flex items-center gap-2 rounded-[12px] border-[#E5E7EB] border-[1px] px-4 py-2 text-sm"
        >
          <PackagePlus size={16} />
          Add Product
        </button>
      </div>

      {/* Products */}
      <div className="space-y-4">
        {products.map((item, index) => {
          const qty = Number(item.quantity || 0);
          const price = Number(item.price || 0);

          const filteredItems = getFilteredItems(item.id);

          return (
            <div
              key={item.id}
              className="rounded-[20px] border border-[#E5E7EB] p-4"
            >
              <div className="flex justify-between mb-3">
                <div className="font-medium">
                  Product {index + 1}
                </div>

                {products.length > 1 && (
                  <button onClick={() => removeProduct(item.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              <div className="relative " data-product-dropdown>
                <input
                  value={item.name}
                  placeholder="Select Product"
                  readOnly
                  onClick={() => {
                    setOpenDropdown(item.id);
                    if (!items.length) fetchItems();
                  }}
                  className="w-full border-[#E5E7EB] border-[1px] rounded-[12px] cursor-pointer border px-3 py-2 text-[14px] outline-[#E5E7EB]"
                />

                {openDropdown === item.id && (
                  <div className="absolute z-40 mt-2 w-full rounded-[14px]  bg-white shadow-lg max-h-[320px] flex flex-col overflow-hidden border-[#E5E7EB] border-[1px]">

                    {/* Search */}
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search product..."
                        value={searchMap[item.id] || ""}
                        onChange={(e) =>
                          setSearchMap((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-[10px] border-[#E5E7EB] border-[1px] px-3 py-2 text-sm  outline-[#E5E7EB]"
                      />
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-[240px]">
                      {itemsLoading ? (
                        <div className="p-3 text-sm text-gray-500">
                          Loading...
                        </div>
                      ) : filteredItems.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">
                          No products found
                        </div>
                      ) : (
                        filteredItems.map((i) => (
                          <button
                            key={i.stock_id}
                            onClick={() =>
                              handleSelectItem(item.id, i)
                            }
                            className="w-full px-3 py-2 text-left hover:bg-[#F9FAFB] flex justify-between items-center"
                          >
                            <div>
                              <div className="text-[14px]">
                                {i.product_name}
                              </div>
                              <div className="text-[12px] text-gray-500">
                                {i.category} • Qty {i.available_qty}
                              </div>
                            </div>

                            <div className="text-[13px] font-medium">
                              ₹{currency(i.unit_price)}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Qty + Price */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleChange(item.id, "quantity", e.target.value)
                  }
                  className="rounded-[12px] border-[#E5E7EB] border-[1px] px-3 py-2"
                />

                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleChange(item.id, "price", e.target.value)
                  }
                  className="rounded-[12px] border-[#E5E7EB] border-[1px] px-3 py-2"
                />
              </div>

              <div className="mt-2 text-sm">
                Subtotal ₹{currency(qty * price)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-5 text-right font-semibold">
        Total ₹{currency(total)}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-4">
        <button onClick={back} className="rounded-[12px] border-[#E5E7EB] border-[1px] px-4 py-2">
          Back
        </button>

        <button
          onClick={onCreateQuotation}
          disabled={loading}
          className="rounded-[12px] bg-blue-600 text-white px-4 py-2 flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating..." : "Create Quotation"}
        </button>
      </div>
    </div>
  );
}