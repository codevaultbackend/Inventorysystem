"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: ReactNode;
  textarea?: boolean;
  select?: boolean;
  options?: Option[];
  disabled?: boolean;
  type?: string;
};

export default function ReusableInputComponent({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  icon,
  textarea = false,
  select = false,
  options = [],
  disabled = false,
  type = "text",
}: Props) {
  const baseFieldClass = `
    w-full rounded-[10px] border bg-white text-[14px] text-[#111827]
    placeholder:text-[#9CA3AF] transition outline-none
    ${error ? "border-[#FCA5A5] focus:border-[#EF4444]" : "border-[#D1D5DB] focus:border-[#93C5FD]"}
    ${icon ? "pl-[42px]" : "pl-3.5"} pr-3.5
    focus:ring-4 ${error ? "focus:ring-[#FEE2E2]" : "focus:ring-[#DBEAFE]"}
    disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]
  `;

  return (
    <div>
      <label className="mb-2 block text-[13px] font-medium text-[#374151]">
        {label}
        {required ? <span className="ml-1 text-[#2563EB]">*</span> : null}
      </label>

      <div className="relative">
        {icon ? (
          <span
            className={`pointer-events-none absolute left-3 z-10 text-[#9CA3AF] ${
              textarea ? "top-3.5" : "top-1/2 -translate-y-1/2"
            }`}
          >
            {icon}
          </span>
        ) : null}

        {select ? (
          <>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`${baseFieldClass} h-[46px] appearance-none`}
            >
              <option value="">{placeholder || "Select option"}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
          </>
        ) : textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
            className={`${baseFieldClass} min-h-[104px] resize-none pt-3 pb-3`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseFieldClass} h-[46px]`}
          />
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-[#DC2626]">{error}</p>
      ) : null}
    </div>
  );
}