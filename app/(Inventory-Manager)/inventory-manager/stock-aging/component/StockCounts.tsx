"use client";

import React, { memo } from "react";

import {
  Package,
  Boxes,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  growth?: string;
};

const cardStyles: Record<
  string,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
  }
> = {
  "Total Items": {
    icon: Package,
    iconBg: "bg-[#F8FAFC]",
    iconColor: "text-[#111827]",
  },

  "Fresh Stocks": {
    icon: Boxes,
    iconBg: "bg-[#ECFDF3]",
    iconColor: "text-[#22C55E]",
  },

  Critical: {
    icon: AlertTriangle,
    iconBg: "bg-[#FEF3F2]",
    iconColor: "text-[#F04438]",
  },

  "Average Aging": {
    icon: TrendingUp,
    iconBg: "bg-[#F4EBFF]",
    iconColor: "text-[#A855F7]",
  },
};

/**
 * EXACT FIGMA VALUE FORMAT
 * + production safe
 */
function formatValue(
  value: string | number
) {
  if (typeof value === "string") {
    return value;
  }

  if (!Number.isFinite(value)) {
    return "0";
  }

  if (value >= 1_000_000_000) {
    return `${(
      value / 1_000_000_000
    ).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(
      value / 1_000
    ).toFixed(1)}K`;
  }

  return Intl.NumberFormat(
    "en-IN"
  ).format(value);
}

function StockCount({
  title,
  value,
  growth = "+12.5%",
}: Props) {
  const currentStyle =
    cardStyles[title] ||
    cardStyles["Total Items"];

  const Icon =
    currentStyle.icon;

  return (
    <div
      className="
        relative
        h-full
        overflow-hidden

        rounded-[20px]
        border
        border-[#EAECF0]

        bg-white

        px-5
        pb-5
        pt-4

        shadow-[0px_1px_2px_rgba(16,24,40,0.04),0px_1px_3px_rgba(16,24,40,0.08)]

        transition-all
        duration-200

        hover:shadow-[0px_4px_14px_rgba(16,24,40,0.08)]
      "
    >
      {/* TOP */}
      <div className="flex items-start justify-between gap-3">
        {/* ICON */}
        <div
          className={`
            flex
            h-[52px]
            w-[52px]
            shrink-0
            items-center
            justify-center

            rounded-[14px]

            ${currentStyle.iconBg}
            ${currentStyle.iconColor}
          `}
        >
          <Icon
            size={22}
            strokeWidth={1.9}
          />
        </div>

        {/* GROWTH */}
        <div className="flex items-center gap-1 pt-[2px]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M4.16699 13.3333L8.33366 9.16667L11.667 12.5L15.8337 8.33333"
              stroke="#22C55E"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M12.5 8.33333H15.8333V11.6667"
              stroke="#22C55E"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span
            className="
              text-[14px]
              font-[600]
              leading-[20px]

              text-[#22C55E]
            "
          >
            {growth}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-5">
        {/* TITLE */}
        <p
          className="
            text-[14px]
            font-[500]
            leading-[20px]

            text-[#98A2B3]
          "
        >
          {title}
        </p>

        {/* VALUE */}
        <h3
          title={String(value)}
          className="
            mt-[10px]

            truncate

            text-[24px]
            font-[700]
            leading-[32px]
            tracking-[-0.03em]

            text-[#101828]

            sm:text-[30px]
            sm:leading-[38px]
          "
        >
          {formatValue(value)}
        </h3>
      </div>

      {/* EXACT FIGMA SOFT BG EFFECT */}
      <div
        className="
          pointer-events-none

          absolute
          right-[-40px]
          top-[-40px]

          h-[120px]
          w-[120px]

          rounded-full

          bg-[#F9FAFB]

          opacity-60
          blur-3xl
        "
      />
    </div>
  );
}

export default memo(
  StockCount
);