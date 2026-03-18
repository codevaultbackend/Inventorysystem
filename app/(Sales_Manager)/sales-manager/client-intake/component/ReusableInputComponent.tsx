"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  select?: boolean;
  options?: Option[];
  disabled?: boolean;
  className?: string;
};

export default function ReusableInputComponent({
  label,
  value,
  onChange,
  placeholder = "",
  icon,
  error,
  required = false,
  type = "text",
  textarea = false,
  select = false,
  options = [],
  disabled = false,
  className = "",
}: Props) {
  const wrapperClass = `
    relative w-full rounded-[10px] border bg-white transition
    ${
      error
        ? "border-[#EF4444] focus-within:border-[#EF4444]"
        : "border-[#D5DBE3] focus-within:border-[#94A3B8]"
    }
    ${disabled ? "cursor-not-allowed bg-[#F9FAFB] opacity-80" : ""}
  `;

  const inputClass = `
    w-full bg-transparent text-[14px] leading-[20px] text-[#111827]
    outline-none placeholder:text-[#9CA3AF]
    ${icon ? "pl-10 pr-4" : "px-4"}
    ${select ? "h-[44px] appearance-none pr-10" : ""}
    ${textarea ? "min-h-[96px] resize-none py-3" : ""}
    ${!textarea && !select ? "h-[44px]" : ""}
    ${className}
  `;

  return (
    <div className="flex w-full flex-col gap-[6px]">
      <label className="text-[13px] font-[500] leading-[18px] text-[#374151]">
        {label}
        {required ? <span className="ml-1 text-[#EF4444]">*</span> : null}
      </label>

      {select ? (
        <div className={wrapperClass}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={inputClass}
          >
            <option value="" disabled>
              {placeholder || "Select"}
            </option>

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      ) : textarea ? (
        <div className={wrapperClass}>
          {icon ? (
            <span className="pointer-events-none absolute left-4 top-4 text-[#6B7280]">
              {icon}
            </span>
          ) : null}

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            disabled={disabled}
            className={`${inputClass} ${icon ? "pl-10" : "pl-4"}`}
          />
        </div>
      ) : (
        <div className={wrapperClass}>
          {icon ? (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
              {icon}
            </span>
          ) : null}

          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      )}

      {error ? (
        <span className="text-[12px] leading-[16px] text-[#DC2626]">
          {error}
        </span>
      ) : null}
    </div>
  );
}