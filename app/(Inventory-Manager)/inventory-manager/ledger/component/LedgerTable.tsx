"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

type Column = {
  key: string;
  label: string;
};

type Props = {
  columns: Column[];
  data: any[];
  onView?: (row: any) => void;
};

const INITIAL_ROWS = 12;
const LOAD_MORE_ROWS = 12;

export default function LedgerTable({ columns, data, onView }: Props) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((row) =>
      Object.values(row ?? {}).join(" ").toLowerCase().includes(query)
    );
  }, [data, search]);

  const visibleRows = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  useEffect(() => {
    setVisibleCount(INITIAL_ROWS);
  }, [search, data]);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        setVisibleCount((prev) =>
          prev >= filtered.length
            ? prev
            : Math.min(prev + LOAD_MORE_ROWS, filtered.length)
        );
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [filtered.length]);

  const hasMore = visibleCount < filtered.length;

  return (
    <div className="w-full overflow-hidden rounded-[24px] bg-white">
      <div className="flex flex-col gap-3 px-4 py-5 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative h-[40px] w-full lg:w-[480px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#9CA3AF]" />

          <input
            type="text"
            placeholder="Search by item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-full w-full rounded-[12px] border border-transparent bg-[#F5F5F5] pl-11 pr-4 text-[13px] font-[500] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#E5E7EB] focus:bg-white"
          />
        </div>
      </div>

      <div className="ledger-table-scroll max-h-[430px] overflow-auto">
        <table className="w-full min-w-[1040px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-20">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="h-[39px] whitespace-nowrap border-y border-[#E5E7EB] bg-[#F3F3F3] px-4 text-left text-[12px] font-[700] text-[#111827] first:pl-5 last:pr-5"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.length ? (
              visibleRows.map((row, i) => (
                <tr
                  key={row?.id ?? i}
                  className="bg-white transition hover:bg-[#FAFBFC]"
                >
                  {columns.map((col) => {
                    const isAction = col.key === "action";

                    return (
                      <td
                        key={col.key}
                        className="h-[39px] whitespace-nowrap border-b border-[#E5E7EB] px-4 text-[12px] font-[600] text-[#111827] first:pl-5 last:pr-5"
                      >
                        {isAction ? (
                          <button
                            type="button"
                            onClick={() => onView?.(row)}
                            className="text-[12px] font-[600] text-[#2563EB] transition hover:text-[#1D4ED8]"
                          >
                            View
                          </button>
                        ) : (
                          row?.[col.key] ?? "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-[180px] bg-white px-5 text-center text-[14px] font-[600] text-[#94A3B8]"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div ref={loaderRef} className="w-full">
            {hasMore ? (
              <div className="px-6 py-4 text-center text-[12px] font-[600] text-[#64748B]">
                Loading more data...
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-[12px] font-[600] text-[#94A3B8]">
                All data loaded
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .ledger-table-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .ledger-table-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .ledger-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .ledger-table-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}