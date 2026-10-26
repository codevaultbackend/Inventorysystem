"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

type FilterValues = {
  date: string;
  type: string;
};

type Props = {
  onFilterChange?: (filters: FilterValues) => void;
};

type ReportOption = {
  label: string;
  value: string;
};

const REPORT_OPTIONS: ReportOption[] = [
  { label: "All", value: "" },
  { label: "Revenue", value: "revenue" },
  { label: "Orders", value: "orders" },
  { label: "Clients", value: "clients" },
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string) {
  const parsed = parseInputDate(value);
  if (!parsed) return "dd/mm/yyyy";
  return `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()}`;
}

function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthMatrix(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const cells: { date: Date; inCurrentMonth: boolean }[] = [];

  for (let i = startWeekDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthLastDate - i),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: new Date(year, month, day),
      inCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - (startWeekDay + daysInMonth) + 1;
    cells.push({
      date: new Date(year, month + 1, nextDay),
      inCurrentMonth: false,
    });
  }

  return cells;
}

export default function ReportFilterBar({ onFilterChange }: Props) {
  const [date, setDate] = useState("");
  const [type, setType] = useState("");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(
    parseInputDate(date) || new Date()
  );

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const typeRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (newDate?: string | null, newType?: string | null) => {
    const filters = {
      date: newDate ?? date,
      type: newType ?? type,
    };

    onFilterChange?.(filters);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setIsCalendarOpen(false);
      }

      if (typeRef.current && !typeRef.current.contains(target)) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = useMemo(() => parseInputDate(date), [date]);
  const today = useMemo(() => new Date(), []);
  const monthCells = useMemo(
    () => getMonthMatrix(calendarViewDate),
    [calendarViewDate]
  );

  const selectedTypeLabel =
    REPORT_OPTIONS.find((item) => item.value === type)?.label || "All";

  const handleSelectDate = (selected: Date) => {
    const value = toInputDate(selected);
    setDate(value);
    setCalendarViewDate(selected);
    setIsCalendarOpen(false);
    handleChange(value, null);
  };

  const handleClearDate = () => {
    setDate("");
    setIsCalendarOpen(false);
    handleChange("", null);
  };

  const handleTodayDate = () => {
    const now = new Date();
    const value = toInputDate(now);
    setDate(value);
    setCalendarViewDate(now);
    setIsCalendarOpen(false);
    handleChange(value, null);
  };

  return (
    <div className="w-full rounded-[24px] border border-[#E4E7EC] bg-white p-[16px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] sm:p-[18px]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="w-full" ref={calendarRef}>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] border border-[#EAECF0] bg-[#F8FAFC] text-[#667085]">
              <Calendar size={18} />
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#344054]">
              Date Range
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCalendarOpen((prev) => !prev);
                setIsTypeOpen(false);
              }}
              className={`flex h-[58px] w-full items-center rounded-[18px] border bg-[#FCFCFD] pl-[18px] pr-[16px] text-left transition-all duration-200 ${
                isCalendarOpen
                  ? "border-[#BFC8D4] bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.08)]"
                  : "border-[#D0D5DD] hover:border-[#BAC3CF] hover:bg-white"
              }`}
            >
              <div className="flex h-[22px] w-[22px] items-center justify-center text-[#667085]">
                <Calendar size={18} />
              </div>

              <span
                className={`ml-3 flex-1 text-[15px] font-medium ${
                  date ? "text-[#101828]" : "text-[#98A2B3]"
                }`}
              >
                {formatDisplayDate(date)}
              </span>

              <div className="flex h-[22px] w-[22px] items-center justify-center text-[#667085]">
                <Calendar size={18} />
              </div>
            </button>

            {isCalendarOpen ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[320px] max-w-full rounded-[20px] border border-[#DDE3EA] bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.14)]">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarViewDate(
                        new Date(
                          calendarViewDate.getFullYear(),
                          calendarViewDate.getMonth() - 1,
                          1
                        )
                      )
                    }
                    className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] border border-[#EAECF0] bg-[#F8FAFC] text-[#475467] transition hover:bg-[#F2F4F7]"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="text-[18px] font-semibold text-[#101828]">
                    {calendarViewDate.toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCalendarViewDate(
                        new Date(
                          calendarViewDate.getFullYear(),
                          calendarViewDate.getMonth() + 1,
                          1
                        )
                      )
                    }
                    className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] border border-[#EAECF0] bg-[#F8FAFC] text-[#475467] transition hover:bg-[#F2F4F7]"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1">
                  {WEEK_DAYS.map((day) => (
                    <div
                      key={day}
                      className="flex h-[34px] items-center justify-center text-[13px] font-semibold text-[#344054]"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {monthCells.map((item, index) => {
                    const isSelected =
                      selectedDate && sameDate(item.date, selectedDate);
                    const isToday = sameDate(item.date, today);

                    return (
                      <button
                        key={`${item.date.toISOString()}-${index}`}
                        type="button"
                        onClick={() => handleSelectDate(item.date)}
                        className={`flex h-[40px] items-center justify-center rounded-[12px] text-[15px] font-medium transition ${
                          isSelected
                            ? "bg-[#1570EF] text-white shadow-[0_8px_18px_rgba(21,112,239,0.28)]"
                            : isToday
                            ? "border border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]"
                            : item.inCurrentMonth
                            ? "text-[#101828] hover:bg-[#F2F4F7]"
                            : "text-[#98A2B3] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {item.date.getDate()}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleClearDate}
                    className="rounded-[12px] px-3 py-2 text-[14px] font-semibold text-[#1570EF] transition hover:bg-[#EFF8FF]"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleTodayDate}
                    className="rounded-[12px] px-3 py-2 text-[14px] font-semibold text-[#1570EF] transition hover:bg-[#EFF8FF]"
                  >
                    Today
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-full" ref={typeRef}>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] border border-[#EAECF0] bg-[#F8FAFC] text-[#667085]">
              <Filter size={18} />
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#344054]">
              Report Type
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsTypeOpen((prev) => !prev);
                setIsCalendarOpen(false);
              }}
              className={`flex h-[58px] w-full items-center rounded-[18px] border bg-[#FCFCFD] pl-[18px] pr-[16px] text-left transition-all duration-200 ${
                isTypeOpen
                  ? "border-[#BFC8D4] bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.08)]"
                  : "border-[#D0D5DD] hover:border-[#BAC3CF] hover:bg-white"
              }`}
            >
              <div className="flex h-[22px] w-[22px] items-center justify-center text-[#98A2B3]">
                <Filter size={18} />
              </div>

              <span className="ml-3 flex-1 text-[15px] font-medium text-[#101828]">
                {selectedTypeLabel}
              </span>

              <div
                className={`flex h-[24px] w-[24px] items-center justify-center rounded-[8px] bg-[#F8FAFC] text-[#98A2B3] transition ${
                  isTypeOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown size={16} />
              </div>
            </button>

            {isTypeOpen ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-full rounded-[20px] border border-[#DDE3EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.14)]">
                <div className="space-y-1">
                  {REPORT_OPTIONS.map((option) => {
                    const isActive = option.value === type;

                    return (
                      <button
                        key={option.value || "all"}
                        type="button"
                        onClick={() => {
                          setType(option.value);
                          setIsTypeOpen(false);
                          handleChange(null, option.value);
                        }}
                        className={`flex w-full items-center rounded-[14px] px-4 py-3 text-left text-[15px] font-medium transition ${
                          isActive
                            ? "bg-[#EFF8FF] text-[#175CD3]"
                            : "text-[#101828] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <span className="flex-1">{option.label}</span>
                        {isActive ? (
                          <span className="h-[8px] w-[8px] rounded-full bg-[#1570EF]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}