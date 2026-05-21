"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  getViewHref?: (row: T) => string | null;
  emptyMessage?: string;
  hideAction?: boolean;
};

const INITIAL_ROWS = 20;
const LOAD_MORE_ROWS = 20;

const EXPORT_API =
  "https://ims-backend-nm9g.onrender.com/combine/inventory/export-csv";

export default function HierarchyTable<
  T extends Record<string, any>
>({
  title,
  subtitle,
  data,
  columns,
  categories = [],
  selectedCategory = "All Categories",
  onCategoryChange,
  getViewHref,
  emptyMessage = "No data found",
  hideAction = false,
}: Props<T>) {
  const [search, setSearch] = useState("");

  const [visibleCount, setVisibleCount] =
    useState(INITIAL_ROWS);

  const [exporting, setExporting] =
    useState(false);

  const loadMoreRef =
    useRef<HTMLDivElement | null>(null);

  /* =========================================
      SEARCH FILTER
  ========================================= */

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.filter((row) => {
      const matchesSearch =
        !query ||
        columns.some((col) => {
          const raw =
            row[col.key as keyof T];

          if (
            raw === undefined ||
            raw === null
          )
            return false;

          return String(raw)
            .toLowerCase()
            .includes(query);
        });

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
    });
  }, [
    data,
    columns,
    search,
    selectedCategory,
  ]);

  /* =========================================
      RESET PAGINATION
  ========================================= */

  useEffect(() => {
    setVisibleCount(INITIAL_ROWS);
  }, [search, selectedCategory]);

  /* =========================================
      AUTO LOAD MORE
  ========================================= */

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting
          ) {
            setVisibleCount((prev) =>
              Math.min(
                prev +
                  LOAD_MORE_ROWS,
                filteredData.length
              )
            );
          }
        },
        {
          rootMargin: "120px",
        }
      );

    observer.observe(target);

    return () =>
      observer.disconnect();
  }, [filteredData.length]);

  /* =========================================
      VISIBLE DATA
  ========================================= */

  const visibleData = useMemo(() => {
    return filteredData.slice(
      0,
      visibleCount
    );
  }, [filteredData, visibleCount]);

  const hasMoreRows =
    visibleCount < filteredData.length;

  const colSpan = hideAction
    ? columns.length
    : columns.length + 1;



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
          await fetch(EXPORT_API, {
            method: "GET",
            headers: {
              Accept: "text/csv",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          });

        if (!response.ok) {
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
          document.createElement("a");

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
        sm:rounded-[24px]
        xl:rounded-[28px]

        border
        border-[#E7ECF2]

        bg-white

        shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)]
      "
    >
      {/* =========================================
          HEADER
      ========================================= */}

      <div
        className="
          flex
          flex-col
          gap-5

          border-b
          border-[#EEF2F6]

          px-4
          py-5

          sm:px-6
          lg:px-7
        "
      >
        {/* TITLE */}
        <div>
          <h2
            className="
              text-[22px]
              sm:text-[24px]

              font-semibold

              tracking-[-0.5px]

              text-[#111827]
            "
          >
            {title}
          </h2>

          {subtitle && (
            <p
              className="
                mt-1
                text-[13px]
                font-medium
                text-[#98A2B3]
              "
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* CONTROLS */}
        <div
          className="
            flex
            flex-col
            gap-3

            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* SEARCH */}
          <div className="relative w-full xl:max-w-[520px]">
            <Search
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#9CA3AF]
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by item..."
              className="
                h-[50px]
                w-full

                rounded-[14px]

                border
                border-[#E6EBF2]

                bg-[#FAFBFC]

                pl-11
                pr-4

                text-[14px]
                font-medium
                text-[#111827]

                outline-none

                transition-all
                duration-200

                placeholder:text-[#9CA3AF]

                focus:border-[#2563EB]
                focus:bg-white
                focus:ring-[4px]
                focus:ring-blue-100
              "
            />
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
                      rounded-[20px]
                      border
                      border-[#EEF2F6]

                      bg-white

                      p-4
                    "
                  >
                    {columns.map(
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

                            border-b
                            border-[#F2F4F7]

                            py-3

                            last:border-b-0
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

                    {!hideAction && (
                      <div className="mt-4">
                        {href ? (
                          <Link
                            href={
                              href
                            }
                            className="
                              inline-flex
                              w-full
                              items-center
                              justify-center

                              rounded-[12px]

                              bg-[#2563EB]

                              px-4
                              py-3

                              text-[14px]
                              font-semibold
                              text-white
                            "
                          >
                            View
                            Details
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              }
            )
          ) : (
            <div
              className="
                py-12
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
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#F8FAFC]">
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
                        whitespace-nowrap

                        border-b
                        border-[#ECEFF3]

                        bg-[#F8FAFC]

                        px-8
                        py-5

                        text-left
                        text-[14px]
                        font-semibold

                        text-[#111827]

                        ${
                          index ===
                          0
                            ? "rounded-tl-[18px]"
                            : ""
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
                      rounded-tr-[18px]

                      border-b
                      border-[#ECEFF3]

                      bg-[#F8FAFC]

                      px-8
                      py-5

                      text-left
                      text-[14px]
                      font-semibold

                      text-[#111827]
                    "
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>

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

                          hover:bg-[#F8FBFF]
                        "
                      >
                        {columns.map(
                          (
                            col
                          ) => (
                            <td
                              key={String(
                                col.key
                              )}
                              className="
                                whitespace-nowrap

                                border-b
                                border-[#EEF2F6]

                                px-8
                                py-5

                                text-[14px]
                                font-medium

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
                            </td>
                          )
                        )}

                        {!hideAction && (
                          <td
                            className="
                              whitespace-nowrap

                              border-b
                              border-[#EEF2F6]

                              px-8
                              py-5
                            "
                          >
                            {href ? (
                              <Link
                                href={
                                  href
                                }
                                className="
                                  text-[14px]
                                  font-semibold

                                  text-[#2563EB]

                                  hover:text-[#1D4ED8]
                                "
                              >
                                View
                              </Link>
                            ) : (
                              <span
                                className="
                                  text-[#98A2B3]
                                "
                              >
                                View
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
                      py-14
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

                hover:bg-[#F9FAFB]
              "
            >
              Load More
            </button>
          )}
        </div>
      )}

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