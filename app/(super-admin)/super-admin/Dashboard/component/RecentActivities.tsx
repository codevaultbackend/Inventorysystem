"use client";

import {
  User,
  Package,
  Settings,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

const activities = [
  {
    title: "User Registered",
    description: "Tech Corporate",
    time: "5 minutes ago",
    icon: User,
    bg: "bg-[#EEF2FF]",
    iconColor: "text-[#4F46E5]",
  },
  {
    title: "Stock Updated",
    description: "Latest System Activities and updates",
    time: "15 minutes ago",
    icon: Package,
    bg: "bg-[#ECFDF5]",
    iconColor: "text-[#16A34A]",
  },
  {
    title: "Setting Updated",
    description: "System",
    time: "1 hour ago",
    icon: Settings,
    bg: "bg-[#F3E8FF]",
    iconColor: "text-[#9333EA]",
  },
  {
    title: "Sales Transaction",
    description: "Sale completed - $4,500",
    time: "7 hours ago",
    icon: DollarSign,
    bg: "bg-[#FEF9C3]",
    iconColor: "text-[#CA8A04]",
  },
  {
    title: "Stock Alert",
    description: "Low stock alert from #2461",
    time: "22 hours ago",
    icon: AlertTriangle,
    bg: "bg-[#FEE2E2]",
    iconColor: "text-[#DC2626]",
  },
];

export default function RecentActivities() {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border border-[#EEF2F6]
        shadow-[0_6px_20px_rgba(0,0,0,0.04)]
        p-6
        w-full
      "
    >
      {/* ================= HEADER ================= */}
      <div className="mb-5">
        <h3 className="text-[18px] font-semibold text-[#0F172A]">
          Recent Activities
        </h3>
        <p className="text-[13px] text-[#64748B] mt-1">
          Latest System Activities and updates
        </p>
      </div>

      {/* ================= ACTIVITIES ================= */}
      <div className="space-y-4">
        {activities.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="
                flex items-start justify-between
                bg-[#F8FAFC]
                rounded-xl
                px-4 py-3
                hover:bg-[#F1F5F9]
                transition
              "
            >
              {/* Left */}
              <div className="flex items-start gap-3">
                <div
                  className={`
                    ${item.bg}
                    w-9 h-9
                    rounded-lg
                    flex items-center justify-center
                  `}
                >
                  <Icon className={`${item.iconColor} w-4 h-4`} />
                </div>

                <div>
                  <p className="text-[14px] font-medium text-[#0F172A]">
                    {item.title}
                  </p>
                  <p className="text-[12px] text-[#64748B] mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Time */}
              <span className="text-[12px] text-[#94A3B8] whitespace-nowrap">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
