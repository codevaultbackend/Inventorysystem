"use client";

import Link from "next/link";

type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  title: string;
  data: T[];
  columns: Column<T>[];
  getViewHref: (row: T) => string;
  emptyMessage?: string;
};

export default function HierarchyTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  getViewHref,
  emptyMessage = "No data found",
}: Props<T>) {
  return (
    <div className="bg-white border border-[#EEF2F6] rounded-2xl shadow-sm p-6">
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">{title}</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#EEF2F6]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left py-3 px-3 text-sm font-semibold text-[#334155]"
                >
                  {col.title}
                </th>
              ))}
              <th className="text-left py-3 px-3 text-sm font-semibold text-[#334155]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((row, index) => (
                <tr key={row.id ?? row.name ?? row.state ?? row.city ?? index} className="border-b border-[#F8FAFC]">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="py-3 px-3 text-sm text-[#0F172A]"
                    >
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "-")}
                    </td>
                  ))}
                  <td className="py-3 px-3">
                    <Link
                      href={getViewHref(row)}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-10 text-center text-sm text-[#64748B]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}