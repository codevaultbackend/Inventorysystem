// ================================
// HierarchyTable.tsx
// ================================

"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  Download,
  Filter,
  Search,
  ChevronRight,
  ArrowDownToLine,
} from "lucide-react";

type Column<T> = {
  key: keyof T | string;

  title: string;

  render?: (
    row: T
  ) => React.ReactNode;
};

type Props<T> = {
  title: string;

  subtitle?: string;

  data: T[];

  columns: Column<T>[];

  categories?: string[];

  selectedCategory?: string;

  onCategoryChange?: (
    value: string
  ) => void;

  getViewHref?: (
    row: T
  ) => string | null;

  emptyMessage?: string;

  hideAction?: boolean;
};

const INITIAL_ROWS = 20;

const LOAD_MORE_ROWS = 20;

const EXPORT_API =
  `https://ims-backend-5usi.onrender.com/combine/inventory/export-csv`;

export default function HierarchyTable<
  T extends Record<
    string,
    any
  >
>({
  title,
  subtitle,
  data = [],
  columns,
  categories = [],
  selectedCategory = "All Categories",
  onCategoryChange,
  getViewHref,
  emptyMessage = "No data found",
  hideAction = false,
}: Props<T>) {
  const [search, setSearch] =
    useState("");

  const [visibleCount, setVisibleCount] =
    useState(INITIAL_ROWS);

  const [exporting, setExporting] =
    useState(false);

  const loadMoreRef =
    useRef<HTMLDivElement | null>(
      null
    );

  // ================================
  // SAFE DATA
  // ================================

  const safeData =
    Array.isArray(data)
      ? data
      : [];

  // ================================
  // FILTERED DATA
  // ================================

  const filteredData =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return safeData.filter(
        (row) => {
          const matchesSearch =
            !query ||
            columns.some(
              (col) => {
                const raw =
                  row[
                    col.key as keyof T
                  ];

                if (
                  raw ===
                    undefined ||
                  raw === null
                ) {
                  return false;
                }

                return String(
                  raw
                )
                  .toLowerCase()
                  .includes(
                    query
                  );
              }
            );

          const matchesCategory =
            selectedCategory ===
              "All Categories" ||
            row.category ===
              selectedCategory ||
            row.categories ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      safeData,
      columns,
      search,
      selectedCategory,
    ]);

  // ================================
  // RESET PAGINATION
  // ================================

  useEffect(() => {
    setVisibleCount(
      INITIAL_ROWS
    );
  }, [
    search,
    selectedCategory,
  ]);

  // ================================
  // AUTO LOAD MORE
  // ================================

  useEffect(() => {
    const target =
      loadMoreRef.current;

    if (!target) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0]
              ?.isIntersecting
          ) {
            setVisibleCount(
              (prev) =>
                Math.min(
                  prev +
                    LOAD_MORE_ROWS,
                  filteredData.length
                )
            );
          }
        },
        {
          rootMargin:
            "120px",
        }
      );

    observer.observe(target);

    return () =>
      observer.disconnect();
  }, [filteredData.length]);

  // ================================
  // VISIBLE DATA
  // ================================

  const visibleData =
    useMemo(() => {
      return filteredData.slice(
        0,
        visibleCount
      );
    }, [
      filteredData,
      visibleCount,
    ]);

  const hasMoreRows =
    visibleCount <
    filteredData.length;

  const colSpan =
    hideAction
      ? columns.length
      : columns.length + 1;

  // ================================
  // EXPORT CSV
  // ================================

  const handleExportCSV =
    async () => {
      try {
        setExporting(true);

        const token =
          localStorage.getItem(
            "token"
          ) ||
          localStorage.getItem(
            "accessToken"
          );

        const response =
          await fetch(
            EXPORT_API,
            {
              method:
                "GET",

              headers: {
                Accept:
                  "text/csv",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Failed to export CSV"
          );
        }

        const blob =
          await response.blob();

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download = `inventory-report-${Date.now()}.csv`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );
      } catch (error) {
        console.error(
          "CSV Export Error:",
          error
        );

        alert(
          "Failed to export CSV"
        );
      } finally {
        setExporting(false);
      }
    };

  return (
    <div
      className="
        overflow-hidden
        rounded-[22px]
        border
        border-[#E6ECF2]
        bg-white
        shadow-[0px_8px_24px_rgba(15,23,42,0.05)]
      "
    >
      {/* =========================================
          HEADER
      ========================================= */}

      <div
        className="
          border-b
          border-[#EEF2F6]
          px-4
          py-5
          sm:px-6
          lg:px-7
        "
      >
        {/* TOP */}
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          {/* TITLE */}
          <div>
            <h2
              className="
                text-[20px]
                font-semibold
                tracking-[-0.4px]
                text-[#111827]
                sm:text-[22px]
              "
            >
              {title}
            </h2>

            {subtitle && (
              <p
                className="
                  mt-1
                  text-[14px]
                  font-medium
                  text-[#667085]
                "
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* DESKTOP ACTIONS */}
          <div
            className="
              hidden
              items-center
              gap-3
              lg:flex
            "
          >
            <button
              type="button"
              onClick={
                handleExportCSV
              }
              disabled={
                exporting
              }
              className="
                flex
                h-[42px]
                items-center
                gap-2
                rounded-[12px]
                border
                border-[#EAECF0]
                bg-white
                px-4
                text-[13px]
                font-medium
                text-[#344054]
                shadow-sm
                transition-all
                duration-200
                hover:bg-[#F9FAFB]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Download
                size={15}
              />

              {exporting
                ? "Exporting..."
                : "Export CSV"}
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div
          className="
            mt-5
            flex
            flex-col
            gap-3
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* SEARCH */}
          <div className="relative w-full xl:max-w-[420px]">
            <Search
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#98A2B3]
              "
            />

            <input
              type="text"
              value={search}
              onChange={(
                e
              ) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search..."
              className="
                h-[48px]
                w-full
                rounded-[14px]
                border
                border-[#EAECF0]
                bg-[#FCFCFD]
                pl-11
                pr-4
                text-[14px]
                font-medium
                text-[#111827]
                outline-none
                transition-all
                duration-200
                placeholder:text-[#98A2B3]
                focus:border-[#2563EB]
                focus:bg-white
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </div>

          {/* RIGHT */}
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
            "
          >
            {/* CATEGORY */}
            {categories.length >
              0 &&
              onCategoryChange && (
                <select
                  value={
                    selectedCategory
                  }
                  onChange={(
                    e
                  ) =>
                    onCategoryChange(
                      e.target
                        .value
                    )
                  }
                  className="
                    h-[48px]
                    w-full
                    rounded-[14px]
                    border
                    border-[#EAECF0]
                    bg-[#FCFCFD]
                    px-4
                    text-[14px]
                    font-medium
                    text-[#344054]
                    outline-none
                    transition-all
                    duration-200
                    focus:border-[#2563EB]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                    sm:min-w-[220px]
                  "
                >
                  {categories.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    )
                  )}
                </select>
              )}

            {/* MOBILE EXPORT */}
            <button
              type="button"
              onClick={
                handleExportCSV
              }
              disabled={
                exporting
              }
              className="
                flex
                h-[48px]
                items-center
                justify-center
                gap-2
                rounded-[14px]
                border
                border-[#EAECF0]
                bg-white
                px-4
                text-[14px]
                font-medium
                text-[#344054]
                shadow-sm
                transition-all
                duration-200
                hover:bg-[#F9FAFB]
                lg:hidden
              "
            >
              <Download
                size={16}
              />

              {exporting
                ? "Exporting..."
                : "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          MOBILE VIEW
      ========================================= */}

      <div className="block lg:hidden">
        <div className="space-y-4 p-4">
          {visibleData.length >
          0 ? (
            visibleData.map(
              (
                row,
                index
              ) => {
                const href =
                  getViewHref
                    ? getViewHref(
                        row
                      )
                    : null;

                return (
                  <div
                    key={index}
                    className="
                      rounded-[18px]
                      border
                      border-[#EEF2F6]
                      bg-white
                      p-4
                      shadow-[0px_1px_2px_rgba(16,24,40,0.04)]
                    "
                  >
                    {/* TITLE */}
                    <div className="mb-4">
                      <h3
                        className="
                          break-words
                          text-[15px]
                          font-semibold
                          leading-[24px]
                          text-[#111827]
                        "
                      >
                        {columns?.[0]
                          ?.render
                          ? columns[0].render(
                              row
                            )
                          : String(
                              row[
                                columns[0]
                                  .key as keyof T
                              ] ??
                                "-"
                            )}
                      </h3>
                    </div>

                    {/* CONTENT */}
                    <div className="space-y-3">
                      {columns
                        .slice(1)
                        .map(
                          (
                            col
                          ) => (
                            <div
                              key={String(
                                col.key
                              )}
                              className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                border-b
                                border-[#F2F4F7]
                                pb-3
                                last:border-b-0
                                last:pb-0
                              "
                            >
                              <span
                                className="
                                  text-[13px]
                                  font-medium
                                  text-[#98A2B3]
                                "
                              >
                                {
                                  col.title
                                }
                              </span>

                              <div
                                className="
                                  text-right
                                  text-[14px]
                                  font-semibold
                                  text-[#111827]
                                "
                              >
                                {col.render
                                  ? col.render(
                                      row
                                    )
                                  : String(
                                      row[
                                        col.key as keyof T
                                      ] ??
                                        "-"
                                    )}
                              </div>
                            </div>
                          )
                        )}
                    </div>

                    {/* ACTION */}
                    {!hideAction &&
                      href && (
                        <div className="mt-5">
                          <Link
                            href={
                              href
                            }
                            className="
                              inline-flex
                              h-[42px]
                              w-full
                              items-center
                              justify-center
                              gap-2
                              rounded-[12px]
                              bg-[#111827]
                              px-4
                              text-[14px]
                              font-semibold
                              text-white
                              transition-all
                              duration-200
                              hover:bg-[#1F2937]
                            "
                          >
                            View
                            Details

                            <ChevronRight
                              size={16}
                            />
                          </Link>
                        </div>
                      )}
                  </div>
                );
              }
            )
          ) : (
            <div
              className="
                py-14
                text-center
                text-[14px]
                font-medium
                text-[#98A2B3]
              "
            >
              {emptyMessage}
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          DESKTOP TABLE
      ========================================= */}

      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            {/* HEADER */}
            <thead>
              <tr className="bg-[#F9FAFB]">
                {columns.map(
                  (
                    col,
                    index
                  ) => (
                    <th
                      key={String(
                        col.key
                      )}
                      className={`
                        border-b
                        border-[#EAECF0]
                        px-6
                        py-5
                        text-left
                        text-[13px]
                        font-semibold
                        tracking-[0.01em]
                        text-[#667085]
                        ${
                          index ===
                          0
                            ? "min-w-[260px]"
                            : "whitespace-nowrap"
                        }
                      `}
                    >
                      {
                        col.title
                      }
                    </th>
                  )
                )}

                {!hideAction && (
                  <th
                    className="
                      whitespace-nowrap
                      border-b
                      border-[#EAECF0]
                      px-6
                      py-5
                      text-right
                      text-[13px]
                      font-semibold
                      tracking-[0.01em]
                      text-[#667085]
                    "
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {visibleData.length >
              0 ? (
                visibleData.map(
                  (
                    row,
                    index
                  ) => {
                    const href =
                      getViewHref
                        ? getViewHref(
                            row
                          )
                        : null;

                    return (
                      <tr
                        key={
                          index
                        }
                        className="
                          transition-all
                          duration-200
                          hover:bg-[#FAFCFF]
                        "
                      >
                        {columns.map(
                          (
                            col,
                            colIndex
                          ) => (
                            <td
                              key={String(
                                col.key
                              )}
                              className={`
                                border-b
                                border-[#F2F4F7]
                                px-6
                                py-5
                                ${
                                  colIndex ===
                                  0
                                    ? "min-w-[260px]"
                                    : "whitespace-nowrap"
                                }
                              `}
                            >
                              <div
                                className={`
                                  text-[14px]
                                  leading-[22px]
                                  ${
                                    colIndex ===
                                    0
                                      ? "font-semibold text-[#111827]"
                                      : "font-medium text-[#667085]"
                                  }
                                `}
                              >
                                {col.render
                                  ? col.render(
                                      row
                                    )
                                  : String(
                                      row[
                                        col.key as keyof T
                                      ] ??
                                        "-"
                                    )}
                              </div>
                            </td>
                          )
                        )}

                        {!hideAction && (
                          <td
                            className="
                              whitespace-nowrap
                              border-b
                              border-[#F2F4F7]
                              px-6
                              py-5
                              text-right
                            "
                          >
                            {href ? (
                              <Link
                                href={
                                  href
                                }
                                className="
                                  inline-flex
                                  h-[36px]
                                  items-center
                                  gap-2
                                  rounded-[10px]
                                  border
                                  border-[#E4E7EC]
                                  bg-white
                                  px-4
                                  text-[13px]
                                  font-semibold
                                  text-[#344054]
                                  transition-all
                                  duration-200
                                  hover:bg-[#F9FAFB]
                                "
                              >
                                View

                                <ChevronRight
                                  size={
                                    14
                                  }
                                />
                              </Link>
                            ) : (
                              <span
                                className="
                                  text-[13px]
                                  font-medium
                                  text-[#98A2B3]
                                "
                              >
                                -
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td
                    colSpan={
                      colSpan
                    }
                    className="
                      py-16
                      text-center
                      text-[14px]
                      font-medium
                      text-[#98A2B3]
                    "
                  >
                    {
                      emptyMessage
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          FOOTER
      ========================================= */}

      {filteredData.length >
        0 && (
        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-[#EEF2F6]
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span
            className="
              text-[13px]
              font-medium
              text-[#667085]
            "
          >
            Showing{" "}
            {Math.min(
              visibleCount,
              filteredData.length
            )}{" "}
            of{" "}
            {
              filteredData.length
            }
          </span>

          {hasMoreRows && (
            <button
              type="button"
              onClick={() =>
                setVisibleCount(
                  (
                    prev
                  ) =>
                    Math.min(
                      prev +
                        LOAD_MORE_ROWS,
                      filteredData.length
                    )
                )
              }
              className="
                rounded-[12px]
                border
                border-[#D0D5DD]
                bg-white
                px-4
                py-2
                text-[14px]
                font-semibold
                text-[#344054]
                transition-all
                duration-200
                hover:bg-[#F9FAFB]
              "
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* INTERSECTION */}
      {hasMoreRows && (
        <div
          ref={
            loadMoreRef
          }
          className="h-[2px]"
        />
      )}
    </div>
  );
}