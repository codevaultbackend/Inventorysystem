// ================================
// MetricCard.tsx
// ================================

"use client";

export default function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[24px]
        border
        border-[#E9EEF5]
        bg-white
        p-5
        shadow-[1px_1px_4px_0_#0000001A]
        transition-all
        duration-300
        hover:-translate-y-[2px]
         max-h-[153px]
      "
    >
      <div className="flex h-full flex-col justify-between">

        <div
          className="
            flex
            h-[52px]
            w-[52px]
            items-center
            justify-center
            rounded-[14px]
            bg-[#F5F8FF]
          "
        >
          {icon}
        </div>

        <div className="mt-6">
          
          <p className="text-[13px] max-[768px]:text-[11px] font-medium text-[#98A2B3]">
            {label}
          </p>

          <div className="mt-2 flex items-end justify-between">
            
            <h3
              className="
                text-[26px]
                max-[768px]:text-[21px]
                font-semibold
                tracking-[-1px]
                text-[#111827]
              "
            >
              {value}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}