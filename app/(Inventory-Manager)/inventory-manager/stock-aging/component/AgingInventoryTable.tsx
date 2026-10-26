"use client";

import {
  Download,
  Search,
  ChevronDown,
} from "lucide-react";

import {
  memo,
  useMemo,
  useState,
  useEffect,
} from "react";

type Row = {
  po: string;
  item: string;
  category: string;
  branch: string;
  qty: number;
  value: string;
  status: string;
};

type Props = {
  data: Row[];
};

const statusStyles: Record<
  string,
  string
> = {
  Good:
    "bg-[#ECFDF3] text-[#16A34A] border border-[#D1FADF]",

  Damaged:
    "bg-[#FEF3F2] text-[#DC2626] border border-[#FECDCA]",

  Repairable:
    "bg-[#FFFAEB] text-[#CA8A04] border border-[#FEF0C7]",
};

function AgingInventoryTable({
  data,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [category, setCategory] =
    useState("All Categories");

  /**
   * DEBOUNCE
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () =>
      clearTimeout(timer);
  }, [search]);

  /**
   * CATEGORY LIST
   */
  const categories = useMemo(() => {
    return [
      "All Categories",
      ...Array.from(
        new Set(
          data
            .map((i) =>
              i.category?.trim()
            )
            .filter(Boolean)
        )
      ),
    ];
  }, [data]);

  /**
   * FILTERED DATA
   */
  const filteredData = useMemo(() => {
    let rows = [...data];

    if (
      category !==
      "All Categories"
    ) {
      rows = rows.filter(
        (i) =>
          i.category ===
          category
      );
    }

    if (
      debouncedSearch.trim()
    ) {
      const query =
        debouncedSearch.toLowerCase();

      rows = rows.filter((i) =>
        `${i.po} ${i.item} ${i.category} ${i.branch} ${i.qty} ${i.value} ${i.status}`
          .toLowerCase()
          .includes(query)
      );
    }

    return rows;
  }, [
    data,
    category,
    debouncedSearch,
  ]);

  /**
   * CSV EXPORT
   */
  const handleExportCSV = () => {
    const headers = [
      "PO",
      "Item",
      "Category",
      "Branch",
      "Qty",
      "Value",
      "Status",
    ];

    const escapeCSV = (
      value: string | number
    ) =>
      `"${String(value).replace(
        /"/g,
        '""'
      )}"`;

    const rows =
      filteredData.map((i) => [
        escapeCSV(i.po),
        escapeCSV(i.item),
        escapeCSV(
          i.category
        ),
        escapeCSV(i.branch),
        escapeCSV(i.qty),
        escapeCSV(i.value),
        escapeCSV(i.status),
      ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "stock-aging-report.csv";

    a.click();

    URL.revokeObjectURL(url);
  };

  /**
   * EMPTY STATE
   */
  const isEmpty =
    filteredData.length === 0;

  return (
    <div
      className="
        overflow-hidden

        rounded-[28px]
        border
        border-[#EAECF0]
        bg-white

        shadow-[1px_1px_4px_0px_#0000001A]
      "
    >
      {/* TOP BAR */}
      <div
        className="
          flex
          flex-col
          gap-4

          border-b
          border-[#F2F4F7]

          p-4

          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* SEARCH */}
        <div className="relative w-full lg:max-w-[420px]">
          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2

              text-[#98A2B3]
            "
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search inventory..."
            className="
              h-[46px]
              w-full

              rounded-[14px]
              border
              border-transparent

              bg-[#F9FAFB]

              pl-11
              pr-4

              text-[14px]
              font-[500]
              text-[#101828]

              outline-none
              transition-all

              placeholder:text-[#98A2B3]

              focus:border-[#D0D5DD]
              focus:bg-white
              focus:shadow-[1px_1px_4px_0px_#0000001A]
            "
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* FILTER */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="
                h-[44px]
                max-[768px]:max-w-[100%]
                max-[768px]:w-[100%]
                appearance-none

                rounded-[14px]
                border
                border-transparent

                bg-[#fff]

                pl-4
                pr-10

                text-[14px]
                font-[500]
                text-[#344054]
                shadow-[1px_1px_4px_0px_#0000001A]

                outline-none
                transition-all

                focus:border-[#D0D5DD]
                focus:bg-white
              "
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={16}
              className="
                pointer-events-none

                absolute
                right-3
                top-1/2
                -translate-y-1/2

                text-[#667085]
              "
            />
          </div>

          {/* EXPORT */}
          <button
            onClick={
              handleExportCSV
            }
            className="
              inline-flex
              h-[44px]
              items-center
              justify-center
              gap-2

              rounded-[14px]
              border
              border-[#EAECF0]

              bg-white
               shadow-[1px_1px_4px_0px_#0000001A]
              px-4

              text-[14px]
              font-[600]
              text-[#344054]

              transition-all

              hover:bg-[#F9FAFB]
            "
          >
            <Download size={16} />

            Export CSV
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="
          overflow-x-auto
          overflow-y-hidden

          scrollbar-thin
          scrollbar-thumb-[#D0D5DD]
          scrollbar-track-transparent
        "
      >
        <table
          className="
            w-full
            min-w-[1050px]

            border-separate
            border-spacing-0
          "
        >
          {/* HEADER */}
          <thead>
            <tr className="bg-[#F0F0F0]">
              {[
                "Purchase Order",
                "Item Name",
                "Category",
                "Branch",
                "Quantity",
                "Value",
                "Status",
              ].map((head) => (
                <th
                  key={head}
                  className="
                    whitespace-nowrap

                    px-5
                    py-[14px]

                    text-left
                    text-[12px]
                    font-[600]
                    leading-[100%]
                    tracking-[0%]

                    text-[#000000]
                  "
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {!isEmpty ? (
              filteredData.map(
                (row) => (
                  <tr
                    key={`${row.po}-${row.item}`}
                    className="
                      border-b
                      border-[#F2F4F7]

                      transition-colors

                      hover:bg-[#FCFCFD]
                    "
                  >
                    {/* PO */}
                    <td
                      className="
                        px-5
                        py-[14px]

                        text-[12px]
                        font-[500]
                        tracking-[-0.15px]
                        text-[#1F1F1F]
                      "
                    >
                      <div
                        className="max-w-[160px] truncate"
                        title={row.po}
                      >
                        {row.po}
                      </div>
                    </td>

                    {/* ITEM */}
                    <td
                      className="
                        px-5
                        py-[14px]

                        text-[12px]
                        font-[400]
                        text-[#0E0C0C]
                      "
                    >
                      <div
                        className="max-w-[240px] truncate"
                        title={
                          row.item
                        }
                      >
                        {row.item}
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td
                      className="
                         px-5
                        py-[14px]

                        text-[12px]
                        font-[400]
                        text-[#0E0C0C]
                      "
                    >
                      {row.category}
                    </td>

                    {/* BRANCH */}
                    <td
                      className="
                         px-5
                        py-[14px]

                        text-[12px]
                        font-[400]
                        text-[#0E0C0C]
                      "
                    >
                      {row.branch}
                    </td>

                    {/* QTY */}
                    <td
                      className="
                        px-5
                        py-[14px]

                        text-[12px]
                        font-[400]
                        text-[#0E0C0C]
                      "
                    >
                      {row.qty}
                    </td>

                    {/* VALUE */}
                    <td
                      className="
                         px-5
                        py-[14px]

                        text-[12px]
                        font-[400]
                        text-[#0E0C0C]
                      "
                    >
                      {row.value}
                    </td>

                    {/* STATUS */}
                    <td
                      className="
                        px-5
                        py-[14px]
                      "
                    >
                      <span
                        className={`
                          inline-flex
                          items-center

                          rounded-full

                          px-[10px]
                          py-[5px]

                          text-[12px]
                          font-[600]
                          leading-none

                          ${statusStyles[
                          row.status
                          ] ||
                          "border border-gray-200 bg-gray-100 text-gray-600"
                          }
                        `}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="
                    px-5
                    py-20

                    text-center
                    text-[14px]
                    font-[500]

                    text-[#98A2B3]
                  "
                >
                  No inventory data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(
  AgingInventoryTable
);