"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  title: string;
  subtitle: string;
  data: T[];
  columns: Column<T>[];
  getViewHref?: (row: T) => string | null;
  emptyMessage?: string;
};

const INITIAL_ROWS = 20;
const LOAD_MORE_ROWS = 20;

export default function HierarchyTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  getViewHref,
  emptyMessage = "No data found",
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const rawValue = row[col.key as keyof T];

        if (rawValue === null || rawValue === undefined) return false;

        return String(rawValue).toLowerCase().includes(query);
      })
    );
  }, [data, columns, search]);

  useEffect(() => {
    setVisibleCount(INITIAL_ROWS);
  }, [search, data]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_ROWS, filteredData.length)
          );
        }
      },
      {
        root: null,
        rootMargin: "120px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [filteredData.length]);

  const visibleData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  const hasMoreRows = visibleCount < filteredData.length;

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E6ECF2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-[#111827]">{title}</h3>
          <p className="mt-1 text-[12px] text-[#98A2B3]">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here..."
              className="h-[40px] w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-3 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0D63C8]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-1 py-1 text-[13px] font-medium text-[#6B7280]"
            >
              Weekly
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="bg-[#F3F6F9]">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]"
                >
                  {col.title}
                </th>
              ))}
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleData.length > 0 ? (
              visibleData.map((row, index) => {
                const rawHref = getViewHref ? getViewHref(row) : null;
                const href =
                  typeof rawHref === "string" && rawHref.trim().length > 0
                    ? rawHref
                    : null;

                return (
                  <tr
                    key={
                      row.id ??
                      row.state ??
                      row.branchName ??
                      row.productName ??
                      row.name ??
                      index
                    }
                    className="border-t border-[#EDF2F7]"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]"
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof T] ?? "-")}
                      </td>
                    ))}

                    <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium">
                      {href ? (
                        <Link
                          href={href}
                          className="text-[#0D63C8] underline underline-offset-2 transition hover:text-[#084A97]"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="cursor-not-allowed text-[#94A3B8]">
                          View
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-10 text-center text-sm text-[#64748B]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="px-6 pb-5 pt-3">
          <div className="flex items-center justify-between gap-3 text-[12px] text-[#64748B]">
            <span>
              Showing {Math.min(visibleCount, filteredData.length)} of{" "}
              {filteredData.length}
            </span>

            {hasMoreRows && (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + LOAD_MORE_ROWS, filteredData.length)
                  )
                }
                className="rounded-lg border border-[#D0D5DD] px-3 py-1.5 font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
              >
                Load more
              </button>
            )}
          </div>

          {hasMoreRows && <div ref={loadMoreRef} className="h-2 w-full" />}
        </div>
      )}
    </div>
  );
}