"use client";

import { Package, AlertTriangle, Users } from "lucide-react";

type Props = {
  data: {
    approvedQuotations: number;
    invoicesGenerated: number;
    pendingApprovals: number;
  };
};

export default function QuickStatus({ data }: Props) {
  const stats = [
    {
      title: "Approved Quotations",
      value: String(data.approvedQuotations),
      icon: Package,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Invoices Generated",
      value: String(data.invoicesGenerated),
      icon: AlertTriangle,
      bg: "bg-yellow-50",
      color: "text-yellow-600",
    },
    {
      title: "Pending Approvals",
      value: String(data.pendingApprovals),
      icon: Users,
      bg: "bg-green-50",
      color: "text-green-600",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-800">
          Quick Status
        </h3>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full ${item.bg}`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>

              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <h4 className="text-lg font-semibold text-gray-900">
                  {item.value}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}