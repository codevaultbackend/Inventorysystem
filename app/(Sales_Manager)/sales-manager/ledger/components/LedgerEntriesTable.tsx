"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { LedgerCompany, formatMoney } from "../data/ledgerData";

type Props = {
  company: LedgerCompany;
  basePath?: string;
};

export default function LedgerEntriesTable({
  company,
  basePath = "/sales-manager/ledger",
}: Props) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[#CDD6E1] bg-white shadow-none">
      <div className="border-b border-[#D9E1EA] px-[22px] py-[20px]">
        <div className="flex items-center gap-[10px]">
          <h2 className="text-[15px] font-semibold leading-none text-[#111827]">
            Company Name :
          </h2>
          <p className="text-[13px] font-medium leading-none text-[#1F2937]">
            {company.companyShort}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1160px] border-collapse">
          <thead>
            <tr className="h-[42px] bg-[#D8E9F8]">
              {[
                "Entry ID",
                "Transactions ID",
                "Client",
                "Date & Time",
                "Received Amt.",
                "Pending Amt.",
                "Amount",
                "Action",
              ].map((head, index) => (
                <th
                  key={head}
                  className={[
                    "whitespace-nowrap px-[18px] text-left text-[11px] font-semibold leading-none text-[#1F2937]",
                    index === 7 ? "text-center" : "",
                  ].join(" ")}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {company.entries.map((entry, index) => (
              <tr
                key={entry.id}
                className={`h-[64px] border-b border-[#EEF2F6] ${
                  index % 2 === 0 ? "bg-[#FAFBFC]" : "bg-white"
                }`}
              >
                <td className="px-[18px] text-[12px] font-semibold text-[#374151]">
                  {entry.entryId}
                </td>

                <td className="px-[18px] text-[12px] font-medium text-[#748092]">
                  {entry.transactionId}
                </td>

                <td className="px-[18px] text-[12px] font-medium text-[#374151]">
                  {entry.client}
                </td>

                <td className="px-[18px] text-[12px] font-medium text-[#6B7280]">
                  {entry.dateTime}
                </td>

                <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                  {formatMoney(entry.receivedAmt)}
                </td>

                <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                  {formatMoney(entry.pendingAmt)}
                </td>

                <td className="px-[18px] text-[12px] font-semibold text-[#16A34A]">
                  {formatMoney(entry.amount)}
                </td>

                <td className="px-[18px] text-center">
                  <Link
                    href={`${basePath}/${company.id}/${entry.id}`}
                    className="inline-flex h-[28px] items-center gap-[5px] rounded-[5px] border border-[#E5E7EB] bg-white px-[11px] text-[11px] font-medium text-[#374151] transition hover:bg-[#F8FAFC]"
                  >
                    <Eye className="h-[12px] w-[12px]" strokeWidth={1.9} />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}