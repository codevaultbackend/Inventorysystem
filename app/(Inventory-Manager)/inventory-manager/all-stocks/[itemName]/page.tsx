"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ChevronLeft,
  Search,
  Layers3,
  Boxes,
  Trash2,
  TrendingUp,
  Loader2,
  X,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";

import {
  inventoryDashboardApi,
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/app/lib/inventoryDashboardApi";
import AddBatch from "../../admin-dashboard/components/AddBatch";

type AgingFilter =
  | "all"
  | "fresh"
  | "critical"
  | "aging"

function getNumericBranchId(value: any): string {
  if (value === null || value === undefined)
    return "";

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return "";

    return (
      trimmed.match(/\d+/)?.[0] || ""
    );
  }

  if (typeof value === "object") {
    return (
      getNumericBranchId(
        value?.branch_id
      ) ||
      getNumericBranchId(
        value?.branchId
      ) ||
      getNumericBranchId(value?.id) ||
      getNumericBranchId(
        value?.branch?.id
      ) ||
      getNumericBranchId(
        value?.branch?.branch_id
      ) ||
      ""
    );
  }

  return "";
}

function getStoredUser() {
  if (typeof window === "undefined")
    return null;

  try {
    const raw =
      localStorage.getItem("user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function resolveBranchId(
  params: any,
  user: any
) {
  const storedUser = getStoredUser();

  return (
    getNumericBranchId(
      params?.branchId
    ) ||
    getNumericBranchId(params?.id) ||
    getNumericBranchId(
      user?.branch_id
    ) ||
    getNumericBranchId(
      user?.branchId
    ) ||
    getNumericBranchId(
      user?.branch?.id
    ) ||
    getNumericBranchId(
      user?.branch?.branch_id
    ) ||
    getNumericBranchId(
      user?.branches?.[0]?.id
    ) ||
    getNumericBranchId(
      user?.branches?.[0]
        ?.branch_id
    ) ||
    getNumericBranchId(
      user?.branches?.[0]
    ) ||
    getNumericBranchId(
      storedUser?.branch_id
    ) ||
    getNumericBranchId(
      storedUser?.branchId
    ) ||
    getNumericBranchId(
      storedUser?.branch?.id
    ) ||
    getNumericBranchId(
      storedUser?.branch
        ?.branch_id
    ) ||
    getNumericBranchId(
      storedUser?.branches?.[0]
        ?.id
    ) ||
    getNumericBranchId(
      storedUser?.branches?.[0]
        ?.branch_id
    ) ||
    getNumericBranchId(
      storedUser?.branches?.[0]
    ) ||
    ""
  );
}

function normalizeItemName(
  value: any
) {
  return decodeURIComponent(
    String(value || "")
  )
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getStatusColor(
  status: string
) {
  const normalized = String(
    status || ""
  )
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "FRESH":
      return {
        bg: "bg-[#EAFBF0]",
        text: "text-[#22C55E]",
      };

    case "CRITICAL":
      return {
        bg: "bg-[#FEF3C7]",
        text: "text-[#D97706]",
      };

    case "NEAR_EXPIRY":
      return {
        bg: "bg-[#FFF7ED]",
        text: "text-[#EA580C]",
      };

    case "EXPIRED":
      return {
        bg: "bg-[#FEECEC]",
        text: "text-[#EF4444]",
      };

    default:
      return {
        bg: "bg-[#EEF2F7]",
        text: "text-[#64748B]",
      };
  }
}

function InventoryItemPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="h-[70px] animate-pulse rounded-[20px] bg-white" />

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-[130px] animate-pulse rounded-[22px] bg-white"
            />
          ))}
        </div>

        <div className="mt-5 h-[520px] animate-pulse rounded-[22px] bg-white" />
      </div>
    </div>
  );
}

export default function InventoryItemPage() {
  const params = useParams();

  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const branchId = useMemo(() => {
    if (authLoading) return "";

    return resolveBranchId(
      params,
      user
    );
  }, [
    authLoading,
    params,
    user,
  ]);

  const itemName = useMemo(() => {
    return normalizeItemName(
      params?.itemName ||
      params?.itemId ||
      params?.slug
    );
  }, [params]);

  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [tableLoading, setTableLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<AgingFilter>("all");

  const [search, setSearch] =
    useState("");

  const [showAddBatchModal, setShowAddBatchModal] =
    useState(false);

  const [creatingBatch, setCreatingBatch] =
    useState(false);

  const [batchError, setBatchError] =
    useState("");

  const [batchSuccess, setBatchSuccess] =
    useState("");

  const [batchForm, setBatchForm] =
    useState({

      batch_no: "",

      received_qty: "",

      unit_price: "",

      received_date: "",

      condition: "GOOD",

      supplier: "",
    });
  const cacheRef = useRef<
    Record<string, any[]>
  >({});

  useEffect(() => {
    if (authLoading) return;

    if (!branchId || !itemName) {
      setLoading(false);

      return;
    }

    let isMounted = true;

    const controller =
      new AbortController();

    const fetchItemDetails =
      async () => {
        try {
          if (!data) {
            setLoading(true);
          } else {
            setTableLoading(true);
          }

          setError("");

          const filterQuery =
            activeFilter === "all"
              ? ""
              : `?filter=${activeFilter}`;

          const endpoint = `/combine/dashboard/item/${encodeURIComponent(
            branchId
          )}/${encodeURIComponent(
            itemName
          )}${filterQuery}`;

          const cacheKey = `${branchId}-${itemName}-${activeFilter}`;

          // CACHE HIT
          if (
            cacheRef.current[
            cacheKey
            ]
          ) {
            setData((prev: any) => ({
              ...prev,
              batches:
                cacheRef.current[
                cacheKey
                ],
            }));

            setTableLoading(false);

            return;
          }

          const res =
            await inventoryDashboardApi.get(
              endpoint,
              {
                signal:
                  controller.signal,
              }
            );

          if (!isMounted) return;

          const responseData =
            res?.data;

          if (
            responseData?.success &&
            responseData?.data
          ) {
            const apiData =
              responseData.data;

            const normalizedData = {
              item:
                apiData?.stock
                  ?.item || itemName,

              stats: {
                totalStock:
                  apiData?.summary
                    ?.currentStock ||
                  0,

                totalValue:
                  apiData?.summary
                    ?.totalValue ||
                  0,

                totalConsumed:
                  apiData?.summary
                    ?.totalConsumed ||
                  0,

                totalBatches:
                  apiData?.summary
                    ?.totalBatches ||
                  0,
              },

              stock: apiData?.stock,

              batches:
                apiData?.batches ||
                [],
            };

            if (!data) {
              setData(normalizedData);
            } else {
              setData((prev: any) => ({
                ...prev,
                batches:
                  normalizedData.batches,
              }));
            }

            // SAVE CACHE
            cacheRef.current[
              cacheKey
            ] =
              normalizedData.batches;
          } else {
            throw new Error(
              responseData?.message ||
              "Invalid API response"
            );
          }
        } catch (err: any) {
          if (!isMounted) return;

          if (
            err?.name ===
            "CanceledError" ||
            err?.code ===
            "ERR_CANCELED"
          ) {
            return;
          }

          if (
            err?.response?.status ===
            401
          ) {
            localStorage.clear();

            router.replace("/login");

            return;
          }

          if (
            err?.response?.status ===
            403
          ) {
            setError(
              "You don't have permission to access this item."
            );

            return;
          }

          if (
            err?.response?.status ===
            404
          ) {
            setError(
              `Item "${itemName}" not found in this branch.`
            );

            return;
          }

          setError(
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to load item details"
          );
        } finally {
          if (isMounted) {
            setLoading(false);

            setTableLoading(false);
          }
        }
      };

    fetchItemDetails();

    return () => {
      isMounted = false;

      controller.abort();
    };
  }, [
    authLoading,
    branchId,
    itemName,
    activeFilter,
  ]);

  const summary = useMemo(() => {
    return {
      totalBatches:
        toNumber(
          data?.stats?.totalBatches
        ) || 0,

      currentStock:
        toNumber(
          data?.stats?.totalStock
        ) || 0,

      totalConsumed:
        toNumber(
          data?.stats
            ?.totalConsumed
        ) || 0,

      totalValue:
        toNumber(
          data?.stats?.totalValue
        ) || 0,
    };
  }, [data]);

  const filteredBatches = useMemo(() => {
    const rows = Array.isArray(
      data?.batches
    )
      ? data?.batches
      : [];

    return rows.filter((row: any) => {
      return (
        !search ||
        String(
          row?.batchNo || ""
        )
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        String(
          row?.supplier || ""
        )
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    });
  }, [data, search]);

  const handleCreateBatch = async () => {

    try {

      setCreatingBatch(true);

      setBatchError("");

      setBatchSuccess("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      const payload = {

        stock_id: data?.stock?.id,

        batch_no: batchForm.batch_no,

        received_qty: Number(
          batchForm.received_qty
        ),

        unit_price: Number(
          batchForm.unit_price
        ),

        received_date:
          batchForm.received_date,

        condition:
          batchForm.condition,

        supplier:
          batchForm.supplier,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/combine/add-new-batch`,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success
      ) {

        throw new Error(
          result?.message ||
          "Failed to create batch"
        );
      }

      /**
       * CLEAR CACHE
       */
      cacheRef.current = {};

      /**
       * UPDATE TABLE + STATS
       */
      setData((prev: any) => ({

        ...prev,

        batches:
          (
            result?.data?.batches || []
          ).map((batch: any) => ({

            batchNo:
              batch.batch_no,

            totalQty:
              batch.total_bundle,

            unitPrice:
              result?.data?.stock
                ?.rate || 0,

            consumedQty:
              batch.consumed_bundle,

            receivedDate:
              batch.received_date,

            supplier:
              batch.supplier,

            expiryStatus:
              batch.status,
          })),

        stats: {

          ...prev?.stats,

          totalStock:
            result?.data?.stock
              ?.quantity || 0,

          totalValue:
            result?.data?.stock
              ?.value || 0,

          totalBatches:
            result?.data?.batches
              ?.length || 0,
        },

        stock:
          result?.data?.stock ||
          prev?.stock,
      }));

      setBatchSuccess(
        "Batch created successfully"
      );

      /**
       * RESET FORM
       */
      setTimeout(() => {

        setShowAddBatchModal(
          false
        );

        setBatchForm({

          batch_no: "",

          received_qty: "",

          unit_price: "",

          received_date: "",

          condition: "GOOD",

          supplier: "",
        });

        setBatchSuccess("");

      }, 800);

    } catch (error: any) {

      console.error(error);

      setBatchError(
        error?.message ||
        "Failed to create batch"
      );

    } finally {

      setCreatingBatch(false);
    }
  };

  if (loading || authLoading) {
    return (
      <InventoryItemPageSkeleton />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <div className="mx-auto max-w-[1440px] rounded-[22px] border border-red-100 bg-white p-7 shadow-[1px_1px_4px_0_#0000001A]">
          <h2 className="text-[24px] font-[600] text-[#111827]">
            Unable to load item
          </h2>

          <p className="mt-2 text-[15px] text-[#EF4444]">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mt-5 inline-flex h-[46px] items-center justify-center rounded-[14px] border border-[#E5E7EB] bg-white px-5 text-[14px] font-[600] text-[#111827]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Batches",
      value: summary.totalBatches,
      icon: Layers3,
      iconBg: "bg-[#EEF4FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Current Stock",
      value: summary.currentStock,
      icon: Boxes,
      iconBg: "bg-[#F3F4F6]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Total Consumed",
      value: summary.totalConsumed,
      icon: Trash2,
      iconBg: "bg-[#F3F4F6]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Total Value",
      value: formatCurrency(
        summary.totalValue
      ),
      icon: TrendingUp,
      iconBg: "bg-[#EAFBF0]",
      iconColor: "text-[#22C55E]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* HEADER */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() =>
              router.back()
            }
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] border border-[#E8EDF3] bg-white text-[#111827] shadow-[1px_1px_4px_0_#0000001A] sm:h-[48px] sm:w-[48px]"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-[600] leading-[30px] tracking-[-0.03em] text-[#111827] sm:text-[28px] sm:leading-[34px]">
              {data?.item || itemName}
            </h1>

            <p className="mt-1 text-[13px] font-[500] text-[#6B7280] sm:text-[14px]">
              Detail product analytics
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-[20px] border border-[#E9EEF5] bg-white p-4 shadow-[1px_1px_4px_0_#0000001A] lg:p-5"
              >
                <div
                  className={`flex h-[42px] w-[42px] items-center justify-center rounded-[12px] lg:h-[48px] lg:w-[48px] ${card.iconBg}`}
                >
                  <Icon
                    className={`h-4 w-4 lg:h-5 lg:w-5 ${card.iconColor}`}
                  />
                </div>

                <p className="mt-4 text-[12px] font-[500] text-[#6B7280] lg:text-[14px]">
                  {card.title}
                </p>

                <div className="mt-2">
                  <h2 className="truncate text-[22px] font-[600] leading-none tracking-[-0.03em] text-[#111827] lg:text-[32px]">
                    {typeof card.value ===
                      "number"
                      ? formatNumber(
                        card.value
                      )
                      : card.value}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="mt-6 rounded-[24px] border border-[#E9EEF5] bg-white p-4 shadow-[1px_1px_4px_0_#0000001A] lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[20px] font-[600] tracking-[-0.02em] text-[#111827] lg:text-[22px]">
                Batch Overview
              </h2>

              <p className="mt-1 text-[13px] text-[#6B7280] lg:text-[14px]">
                Top batches for this item
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAddBatchModal(
                  true
                )
              }
              className="h-[42px] rounded-[14px] bg-black px-5 text-[14px] font-[600] text-white transition-all hover:opacity-90"
            >
              Add Batch
            </button>
          </div>

          {/* FILTERS */}
          <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* SEARCH */}
            <div className="relative w-full xl:max-w-[420px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />

              <input
                aria-label="Search batches"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search batch..."
                className="h-[44px] w-full rounded-[14px] border border-[#E5E7EB] bg-[#FAFAFA] pl-11 pr-4 text-[14px] font-[500] text-[#111827] outline-none"
              />
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                "all",
                "fresh",
                "aging",
                "critical",
                
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      item as AgingFilter
                    )
                  }
                  className={`rounded-[12px] px-4 py-2 text-[13px] font-[600] capitalize transition-all lg:text-[14px] ${activeFilter === item
                    ? "bg-[#0B63C9] text-white shadow-[1px_1px_4px_0_#0000001A]"
                    : "border border-[#E5E7EB] bg-white text-[#374151]"
                    }`}
                >
                  {item.replace(
                    "_",
                    " "
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="mt-5 overflow-hidden rounded-[20px] border border-[#EEF2F7]">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {[
                      "Batch",
                      "Qty",
                      "Price",
                      "Consumed",
                      "Date",
                      "Supplier",
                      "Status",
                    ].map((head) => (
                      <th
                        key={head}
                        className="whitespace-nowrap px-4 py-4 text-left text-[12px] font-[600] text-[#374151] lg:px-6 lg:text-[13px]"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16"
                      >
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[#0B63C9]" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredBatches.length >
                    0 ? (
                    filteredBatches.map(
                      (
                        row: any,
                        index: number
                      ) => {
                        const currentStatus =
                          row?.expiryStatus ||
                          "FRESH";

                        const statusColor =
                          getStatusColor(
                            currentStatus
                          );

                        return (
                          <tr
                            key={index}
                            className="border-t border-[#F1F5F9] hover:bg-[#FAFBFC]"
                          >
                            <td className="whitespace-nowrap px-4 py-4 text-[13px] font-[500] text-[#111827] lg:px-6 lg:text-[14px]">
                              {row?.batchNo ||
                                "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-[13px] font-[500] text-[#111827] lg:px-6 lg:text-[14px]">
                              {formatNumber(
                                toNumber(
                                  row?.totalQty
                                )
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-[13px] font-[500] text-[#111827] lg:px-6 lg:text-[14px]">
                              {formatCurrency(
                                toNumber(
                                  row?.unitPrice
                                )
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-[13px] font-[500] text-[#111827] lg:px-6 lg:text-[14px]">
                              {formatNumber(
                                toNumber(
                                  row?.consumedQty
                                )
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-[13px] font-[500] text-[#111827] lg:px-6 lg:text-[14px]">
                              {row?.receivedDate
                                ? new Date(
                                  row.receivedDate
                                ).toLocaleDateString(
                                  "en-GB"
                                )
                                : "-"}
                            </td>

                            <td className="max-w-[160px] truncate px-4 py-4 text-[13px] font-[500] text-[#111827] lg:px-6 lg:text-[14px]">
                              {row?.supplier ||
                                "N/A"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 lg:px-6">
                              <span
                                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-[700] uppercase lg:text-[11px] ${statusColor.bg} ${statusColor.text}`}
                              >
                                {currentStatus.replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
                            <Search className="h-6 w-6 text-[#9CA3AF]" />
                          </div>

                          <h3 className="mt-4 text-[16px] font-[600] text-[#111827]">
                            No batches found
                          </h3>

                          <p className="mt-1 text-[14px] text-[#94A3B8]">
                            Try changing filters
                            or search query.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>



      {showAddBatchModal && (
        <div className="">
          <AddBatch
            open={showAddBatchModal}
            onClose={() =>
              setShowAddBatchModal(false)
            }
            batchForm={batchForm}
            setBatchForm={setBatchForm}
            creatingBatch={creatingBatch}
            handleCreateBatch={handleCreateBatch}
            batchError={batchError}
            batchSuccess={batchSuccess}
          />
        </div>
      )}


    </div>
  );
}