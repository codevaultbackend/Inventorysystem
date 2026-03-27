"use client";

import { Download, Search, ChevronDown } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";

type Row = {
  po: string;
  item: string;
  category: string;
  branch: string;
  qty: string;
  value: string;
  status: "Good" | "Damaged" | "Repairable";
};

type Props = {
  data: Row[];
};

const statusStyles: Record<Row["status"], string> = {
  Good: "bg-[#ECFDF3] text-[#22C55E]",
  Damaged: "bg-[#FEF3F2] text-[#F04438]",
  Repairable: "bg-[#FFFAEB] text-[#EAB308]",
};

const INITIAL_ROWS = 20;
const LOAD_MORE_ROWS = 20;

export default function AgingInventoryTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(
    () => ["All Categories", ...new Set(data.map((item) => item.category))],
    [data]
  );

  const filteredData = useMemo(() => {
    let rows = [...data];

    if (category !== "All Categories") {
      rows = rows.filter((item) => item.category === category);
    }

    if (search.trim()) {
      const value = search.toLowerCase();
      rows = rows.filter((item) =>
        `${item.po} ${item.item} ${item.category} ${item.branch} ${item.qty} ${item.value} ${item.status}`
          .toLowerCase()
          .includes(value)
      );
    }

    return rows;
  }, [data, search, category]);

  useEffect(() => {
    setVisibleCount(INITIAL_ROWS);
  }, [search, category, data]);

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

  const handleExportCSV = () => {
    const headers = [
      "Purchase Order No.",
      "Item Name",
      "Categories",
      "Branch Name",
      "Quantity",
      "Value",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.po,
      item.item,
      item.category,
      item.branch,
      item.qty,
      item.value,
      item.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "stock-aging-table.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)] sm:rounded-[24px]">
      <div className="flex flex-col gap-3 border-b border-[#EAECF0] px-3 pb-4 pt-4 sm:px-4 sm:pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[470px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
          />
          <input
            type="text"
            placeholder="Search by item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[44px] w-full rounded-[14px] border border-[#EAECF0] bg-[#F9FAFB] pl-11 pr-4 text-[14px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-[#D0D5DD] focus:bg-white sm:h-[46px]"
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:items-center">
          <div className="relative w-full sm:w-[180px]">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-[42px] w-full appearance-none rounded-[12px] border border-[#EAECF0] bg-white pl-4 pr-10 text-[14px] font-[500] text-[#344054] outline-none focus:border-[#D0D5DD]"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#EAECF0] bg-white px-4 text-[14px] font-[500] text-[#344054] shadow-[0px_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[#F9FAFB] sm:w-auto"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#F9FAFB]">
              <th className="px-4 py-4 text-left text-[13px] font-[600] text-[#111827] sm:text-[14px]">
                Purchase Order No.
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-[600] text-[#111827] sm:text-[14px]">
                Item Name
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-[600] text-[#111827] sm:text-[14px]">
                Categories
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-[600] text-[#111827] sm:text-[14px]">
                Branch Name
              </th>
              <th className="px-4 py-4 text-center text-[13px] font-[600] text-[#111827] sm:text-[14px]">
                Quantity
              </th>
              <th className="px-4 py-4 text-center text-[13px] font-[600] text-[#111827] sm:text-[14px]">
                Value
              </th>
              <th className="px-4 py-4 text-right text-[13px] font-[600] text-[#111827] sm:text-[14px]">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleData.length > 0 ? (
              visibleData.map((item, index) => (
                <tr
                  key={`${item.po}-${item.item}-${index}`}
                  className="hover:bg-[#FCFCFD]"
                >
                  <td className="border-b border-[#EAECF0] px-4 py-[16px] text-[14px] font-[500] text-[#344054]">
                    {item.po}
                  </td>
                  <td className="border-b border-[#EAECF0] px-4 py-[16px] text-[14px] font-[500] text-[#344054]">
                    {item.item}
                  </td>
                  <td className="border-b border-[#EAECF0] px-4 py-[16px] text-[14px] font-[500] text-[#344054]">
                    {item.category}
                  </td>
                  <td className="border-b border-[#EAECF0] px-4 py-[16px] text-[14px] font-[500] text-[#344054]">
                    {item.branch}
                  </td>
                  <td className="border-b border-[#EAECF0] px-4 py-[16px] text-center text-[14px] font-[500] text-[#344054]">
                    {item.qty}
                  </td>
                  <td className="border-b border-[#EAECF0] px-4 py-[16px] text-center text-[14px] font-[500] text-[#344054]">
                    {item.value}
                  </td>
                  <td className="border-b border-[#EAECF0] px-4 py-[16px] text-right">
                    <span
                      className={`inline-flex h-[24px] items-center rounded-full px-[10px] text-[12px] font-[500] leading-none ${statusStyles[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[14px] text-[#98A2B3]"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="px-4 pb-4 pt-3 sm:px-5">
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