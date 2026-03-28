"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Upload, Download } from "lucide-react";

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
      Object.values(row ?? {})
        .join(" ")
        .toLowerCase()
        .includes(query)
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
        const firstEntry = entries[0];

        if (!firstEntry?.isIntersecting) return;

        setVisibleCount((prev) => {
          if (prev >= filtered.length) return prev;
          return Math.min(prev + LOAD_MORE_ROWS, filtered.length);
        });
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
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full max-w-[420px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F5F6F8] text-sm outline-none"
          />
        </div>

       
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-[#F3F4F6] text-gray-600">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-6 py-3 font-semibold whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {visibleRows.map((row, i) => (
              <tr key={row?.id ?? i} className="hover:bg-gray-50 border-[#D3D3D3]">
                {columns.map((col) => {
                  if (col.key === "action") {
                    return (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onView?.(row)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-gray-700 whitespace-nowrap"
                    >
                      {row?.[col.key] ?? "-"}
                    </td>
                  );
                })}
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
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
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                Loading more data...
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-400">
                All data loaded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}