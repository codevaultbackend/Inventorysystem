"use client";

import {
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
  useEffect,
} from "react";

import {
  AlertTriangle,
  Loader2,
  PackagePlus,
  Trash2,
  X,
} from "lucide-react";

import type { Product } from "./ClientIntakePage";

type Props = {
  products: Product[];

  setProducts: Dispatch<
    SetStateAction<Product[]>
  >;

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

type LowStockPopupState = {
  open: boolean;

  itemName: string;

  availableQty: number;

  requestedQty: number;
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

const currency = (
  value: number
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }
  ).format(value);

export default function RequirementsStep({
  products,
  setProducts,
  total,
  onCreateQuotation,
  back,
  loading,
}: Props) {

  const [items, setItems] =
    useState<ItemList[]>(
      []
    );

  const [
    itemsLoading,
    setItemsLoading,
  ] = useState(false);

  const [
    openDropdown,
    setOpenDropdown,
  ] = useState<string | null>(
    null
  );

  const BaseUrl =
    process.env
      .NEXT_PUBLIC_API_BASE_URL;

  const [
    searchMap,
    setSearchMap,
  ] = useState<
    Record<string, string>
  >({});

  /**
   * =========================
   * LOW STOCK POPUP
   * =========================
   */

  const [
    lowStockPopup,
    setLowStockPopup,
  ] =
    useState<LowStockPopupState>({
      open: false,

      itemName: "",

      availableQty: 0,

      requestedQty: 0,
    });

  /**
   * =========================
   * FETCH
   * =========================
   */

  const fetchItems =
    async () => {

      try {

        setItemsLoading(
          true
        );

        const token =
          typeof window !==
          "undefined"
            ? localStorage.getItem(
                "accessToken"
              ) ||
              localStorage.getItem(
                "token"
              )
            : null;

        const res =
          await fetch(
            `${BaseUrl}/sales/getitemlist`,
            {
              headers:
                token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {},
            }
          );

        const data =
          await res.json();

        if (
          data?.success
        ) {

          setItems(
            data.data || []
          );
        }

      } catch (error) {

        console.error(
          error
        );

      } finally {

        setItemsLoading(
          false
        );
      }
    };

  /**
   * =========================
   * FILTER
   * =========================
   */

  const getFilteredItems =
    (
      productId: string
    ) => {

      const search =
        searchMap[
          productId
        ] || "";

      if (!search) {
        return items;
      }

      return items.filter(
        (item) =>
          item.product_name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    };

  /**
   * =========================
   * SELECT ITEM
   * =========================
   */

  const handleSelectItem =
    (
      productId: string,
      item: ItemList
    ) => {

      setProducts(
        (prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,

                  name:
                    item.product_name,

                  price: String(
                    item.unit_price
                  ),

                  hsn:
                    item.hsn ||
                    "",

                  unit:
                    item.unit ||
                    "",
                }
              : p
          )
      );

      setOpenDropdown(
        null
      );

      setSearchMap(
        (prev) => ({
          ...prev,

          [productId]:
            "",
        })
      );
    };

  /**
   * =========================
   * OUTSIDE CLICK
   * =========================
   */

  useEffect(() => {

    const handleClickOutside =
      (
        event: MouseEvent
      ) => {

        const target =
          event.target as HTMLElement;

        if (
          target.closest(
            "[data-product-dropdown]"
          )
        ) {
          return;
        }

        setOpenDropdown(
          null
        );
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  /**
   * =========================
   * CHANGE
   * =========================
   */

  const handleChange =
    (
      id: string,
      field: keyof Product,
      value: string
    ) => {

      setProducts(
        (prev) =>
          prev.map((item) => {

            if (
              item.id !== id
            ) {
              return item;
            }

            const updated =
              {
                ...item,

                [field]:
                  value,
              };

            /**
             * =========================
             * LOW STOCK VALIDATION
             * =========================
             */

            if (
              field ===
              "quantity"
            ) {

              const matchedItem =
                items.find(
                  (
                    stock
                  ) =>
                    stock.product_name ===
                    updated.name
                );

              const requestedQty =
                Number(
                  value || 0
                );

              const availableQty =
                Number(
                  matchedItem?.available_qty ||
                    0
                );

              if (
                matchedItem &&
                requestedQty >
                  availableQty
              ) {

                setLowStockPopup(
                  {
                    open: true,

                    itemName:
                      matchedItem.product_name,

                    availableQty,

                    requestedQty,
                  }
                );
              }
            }

            return updated;
          })
      );
    };

  /**
   * =========================
   * ADD PRODUCT
   * =========================
   */

  const addProduct =
    () =>
      setProducts(
        (prev) => [
          ...prev,
          createProduct(),
        ]
      );

  /**
   * =========================
   * REMOVE PRODUCT
   * =========================
   */

  const removeProduct =
    (id: string) =>
      setProducts(
        (prev) =>
          prev.length >
          1
            ? prev.filter(
                (item) =>
                  item.id !==
                  id
              )
            : prev
      );

  /**
   * =========================
   * UI
   * =========================
   */

  return (
    <>
      <div className="rounded-[30px] border border-[#E5E7EB] bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="mb-4 flex justify-between">

          <h3 className="text-[18px] font-semibold text-[#111827]">
            Product Requirements
          </h3>
        </div>

        {/* Products */}
        <div className="space-y-4">

          {products.map(
            (
              item,
              index
            ) => {

              const qty =
                Number(
                  item.quantity ||
                    0
                );

              const price =
                Number(
                  item.price ||
                    0
                );

              const filteredItems =
                getFilteredItems(
                  item.id
                );

              return (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-[#E5E7EB] p-4"
                >

                  <div className="mb-3 flex justify-between">

                    <div className="font-medium text-[#111827]">
                      Product{" "}
                      {index + 1}
                    </div>

                    {products.length >
                      1 && (
                      <button
                        onClick={() =>
                          removeProduct(
                            item.id
                          )
                        }
                        className="text-[#667085] transition hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  <div
                    className="relative"
                    data-product-dropdown
                  >

                    <input
                      value={
                        item.name
                      }
                      placeholder="Select Product"
                      readOnly
                      onClick={() => {

                        setOpenDropdown(
                          item.id
                        );

                        if (
                          !items.length
                        ) {
                          fetchItems();
                        }
                      }}
                      className="w-full cursor-pointer rounded-[14px] border border-[#E5E7EB] px-3 py-3 text-[14px] outline-none transition focus:border-blue-500"
                    />

                    {openDropdown ===
                      item.id && (
                      <div className="absolute z-40 mt-2 flex max-h-[320px] w-full flex-col overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0px_16px_48px_rgba(15,23,42,0.08)]">

                        {/* Search */}
                        <div className="border-b border-[#F1F5F9] p-2">

                          <input
                            type="text"
                            placeholder="Search product..."
                            value={
                              searchMap[
                                item.id
                              ] ||
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              setSearchMap(
                                (
                                  prev
                                ) => ({
                                  ...prev,

                                  [item.id]:
                                    e
                                      .target
                                      .value,
                                })
                              )
                            }
                            className="w-full rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                          />
                        </div>

                        {/* List */}
                        <div className="max-h-[240px] overflow-y-auto">

                          {itemsLoading ? (
                            <div className="flex items-center gap-2 p-4 text-sm text-[#667085]">

                              <Loader2 className="h-4 w-4 animate-spin" />

                              Loading...
                            </div>
                          ) : filteredItems.length ===
                            0 ? (
                            <div className="p-4 text-sm text-[#667085]">
                              No products found
                            </div>
                          ) : (
                            filteredItems.map(
                              (
                                i
                              ) => (
                                <button
                                  key={
                                    i.stock_id
                                  }
                                  onClick={() =>
                                    handleSelectItem(
                                      item.id,
                                      i
                                    )
                                  }
                                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#F8FAFC]"
                                >

                                  <div>

                                    <div className="text-[14px] font-medium text-[#111827]">
                                      {
                                        i.product_name
                                      }
                                    </div>

                                    <div className="mt-1 text-[12px] text-[#667085]">
                                      {
                                        i.category
                                      }{" "}
                                      • Qty{" "}
                                      {
                                        i.available_qty
                                      }
                                    </div>
                                  </div>

                                  <div className="text-[13px] font-semibold text-[#111827]">
                                    ₹
                                    {currency(
                                      i.unit_price
                                    )}
                                  </div>
                                </button>
                              )
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Qty + Price */}
                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <input
                      type="number"
                      value={
                        item.quantity
                      }
                      onChange={(
                        e
                      ) =>
                        handleChange(
                          item.id,
                          "quantity",
                          e.target
                            .value
                        )
                      }
                      className="rounded-[14px] border border-[#E5E7EB] px-3 py-3 outline-none transition focus:border-blue-500"
                    />

                    <input
                      type="number"
                      value={
                        item.price
                      }
                      onChange={(
                        e
                      ) =>
                        handleChange(
                          item.id,
                          "price",
                          e.target
                            .value
                        )
                      }
                      className="rounded-[14px] border border-[#E5E7EB] px-3 py-3 outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div className="mt-3 text-[14px] font-medium text-[#344054]">

                    Subtotal ₹
                    {currency(
                      qty *
                        price
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Add Product */}
        <button
          onClick={addProduct}
          className="mt-[15px] flex items-center gap-2 rounded-[14px] border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >

          <PackagePlus size={16} />

          Add Product
        </button>

        {/* Total */}
        <div className="mt-5 text-right text-[18px] font-semibold text-[#111827]">

          Total ₹
          {currency(total)}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-3">

          <button
            onClick={back}
            className="rounded-[14px] border border-[#E5E7EB] px-5 py-2.5 font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Back
          </button>

          <button
            onClick={
              onCreateQuotation
            }
            disabled={
              loading
            }
            className="flex items-center gap-2 rounded-[14px] bg-blue-600 px-5 py-2.5 font-medium text-white shadow-[0px_8px_20px_rgba(37,99,235,0.24)] transition hover:bg-blue-700 disabled:opacity-70"
          >

            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {loading
              ? "Creating..."
              : "Create Quotation"}
          </button>
        </div>
      </div>

      {/* =========================
          LOW STOCK MODAL
      ========================= */}
      {lowStockPopup.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[3px]">

          <div className="relative w-full max-w-[640px] rounded-[32px] bg-white px-8 py-8 shadow-[0px_24px_80px_rgba(15,23,42,0.28)]">

            {/* Close */}
            <button
              onClick={() =>
                setLowStockPopup({
                  open: false,

                  itemName: "",

                  availableQty: 0,

                  requestedQty: 0,
                })
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC] text-[#667085] transition hover:bg-[#EEF2F6]"
            >

              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-[#FEF2F2]">

              <AlertTriangle className="h-9 w-9 text-[#EF4444]" />
            </div>

            {/* Title */}
            <h2 className="mt-6 text-center text-[36px] font-bold tracking-[-0.04em] text-[#111827]">
              Limited Stock Available
            </h2>

            {/* Description */}
            <p className="mx-auto mt-4 max-w-[520px] text-center text-[17px] font-medium leading-[28px] text-[#667085]">

              The requested quantity exceeds the currently available stock.
              Please reduce the quantity and try again.
            </p>

            {/* Info Box */}
            <div className="mt-7 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4">

              <div className="flex flex-wrap items-center justify-center gap-4 text-center">

                <div className="text-[15px] font-medium text-[#475467]">

                  Item Name:{" "}

                  <span className="font-semibold text-[#EF4444]">
                    {
                      lowStockPopup.itemName
                    }
                  </span>
                </div>

                <div className="h-5 w-[1px] bg-[#FCA5A5]" />

                <div className="text-[15px] font-medium text-[#475467]">

                  Available Stock:{" "}

                  <span className="font-semibold text-[#EF4444]">
                    {
                      lowStockPopup.availableQty
                    }
                  </span>
                </div>

                <div className="h-5 w-[1px] bg-[#FCA5A5]" />

                <div className="text-[15px] font-medium text-[#475467]">

                  Requested Quantity:{" "}

                  <span className="font-semibold text-[#EF4444]">
                    {
                      lowStockPopup.requestedQty
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center">

              <button
                onClick={() =>
                  setLowStockPopup({
                    open: false,

                    itemName: "",

                    availableQty: 0,

                    requestedQty: 0,
                  })
                }
                className="rounded-[16px] bg-[#2563EB] px-8 py-3 text-[15px] font-semibold text-white shadow-[0px_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-[#1D4ED8]"
              >
                Create Quatation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}