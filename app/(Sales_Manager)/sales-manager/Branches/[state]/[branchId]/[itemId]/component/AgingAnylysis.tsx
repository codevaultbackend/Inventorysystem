"use client";

import { formatCurrency, formatDateCell, formatNumber, toNumber } from "@/app/lib/salesDashboardApi";

type AgingRow = {
  date: string | Date;
  aging?: string;
  invoiceNumber: string;
  clientName: string;
  branch: string;
  qty: number | string;
  rate: number | string;
  amount: number | string;
  status: string;
};

type Props = {
  data?: AgingRow[];
};

export default function AgingAnalysis({ data = [] }: Props) {
  const getStatusStyle = (status: string) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "good") return "bg-[#DCFCE7] text-[#16A34A]";
    if (normalized === "damaged") return "bg-[#FEE2E2] text-[#EF4444]";
    if (normalized === "repairable") return "bg-[#FEF3C7] text-[#D97706]";
    return "bg-[#E5E7EB] text-[#6B7280]";
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E6ECF2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="px-6 py-5">
        <h3 className="text-[16px] font-semibold text-[#111827]">Product Analysis</h3>
        <p className="mt-1 text-[12px] text-[#98A2B3]">Freshness Status</p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-[1100px] w-full">
          <thead className="bg-[#F3F6F9]">
            <tr>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Date</th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Invoice Number</th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Client Name</th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Branch</th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Qty</th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Rate</th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Amount</th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[14px] font-semibold text-[#111827]">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((item, index) => (
                <tr key={`${item.invoiceNumber}-${index}`} className="border-t border-[#EDF2F7]">
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    {formatDateCell(item.date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    {item.invoiceNumber || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    {item.clientName || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    {item.branch || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    {formatNumber(toNumber(item.qty))}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    {formatCurrency(toNumber(item.rate))}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    {formatCurrency(toNumber(item.amount))}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-[#111827]">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status || "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-[#64748B]">
                  No product analysis found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}