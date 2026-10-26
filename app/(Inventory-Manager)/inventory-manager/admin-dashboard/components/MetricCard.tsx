// ================================
// MetricCard.tsx
// ================================

"use client";

type Props = {
  label: string;
  value: string;
  icon: React.ReactNode;

  trend?: string;

  positive?: boolean;
};

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  positive = true,
}: Props) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-[#EAECF0]
        h-[153px]
        bg-white
        p-4
        sm:p-5
        shadow-[1px_1px_4px_0px_#0000001A]
        transition-all
        duration-300
        hover:shadow-[1px_1px_4px_0px_#0000001A]
      "
    >
      {/* TOP GLOW */}
      <div
        className="
          absolute
          right-[-40px]
          top-[-40px]
          h-[100px]
          w-[100px]
          rounded-full
          bg-[#3B82F6]/[0.04]
          blur-3xl
        "
      />

      <div className="relative flex h-full min-h-[138px] flex-col gap-3">
        {/* ICON */}
        <div
          className="
            flex
            h-[48px]
            w-[48px]
            items-center
            justify-center
            rounded-[14px]
            bg-[#F5F8FF]
            transition-all
            duration-300
            group-hover:scale-[1.03]
          "
        >
          {icon}
        </div>

        {/* CONTENT */}
        <div className="">
          {/* LABEL */}
          <p
            className="
              text-[12px]
              sm:text-[13px]
              font-medium
              leading-[18px]
              text-[#98A2B3]
            "
          >
            {label}
          </p>

          {/* VALUE + TREND */}
          <div className="mt-2 flex items-end justify-between gap-3">
            {/* VALUE */}
            <h3
              className="
                truncate
                text-[22px]
                sm:text-[26px]
                font-semibold
                leading-none
                tracking-[-0.8px]
                text-[#111827]
              "
            >
              {value}
            </h3>

            {/* TREND */}
            {trend && (
              <div
                className={`
                  mb-[2px]
                  inline-flex
                  shrink-0
                  items-center
                  gap-[4px]
                  rounded-full
                  px-[10px]
                  py-[5px]
                  text-[12px]
                  font-semibold
                  ${
                    positive
                      ? "bg-[#ECFDF3] text-[#16A34A]"
                      : "bg-[#FEF3F2] text-[#DC2626]"
                  }
                `}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={
                    positive
                      ? ""
                      : "rotate-180"
                  }
                >
                  <path
                    d="M2.5 8.5L9 2M9 2H4.5M9 2V6.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {trend}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}