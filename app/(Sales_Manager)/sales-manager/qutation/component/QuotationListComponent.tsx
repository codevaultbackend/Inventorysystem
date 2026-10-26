"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import QuotationCard, { Quotation } from "./QuotationCard";

export default function QuotationList() {
  const [search, setSearch] = useState("");

  const quotations: Quotation[] = [
    {
      id: 1,
      quotation_no: "QT338540",
      client_id: 1,
      branch_id: 1,
      total_amount: 2000,
      gst_amount: 360,
      valid_till: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      client: {
        id: 1,
        name: "Amit Sharma",
        phone: "9876543210",
        email: "amit@example.com",
      },
      branch: {
        id: 1,
        name: "Delhi Branch",
        location: "Delhi",
      },
      items: [],
    },
    {
      id: 2,
      quotation_no: "QT338541",
      client_id: 2,
      branch_id: 1,
      total_amount: 2000,
      gst_amount: 360,
      valid_till: null,
      status: "rejected",
      createdAt: new Date().toISOString(),
      client: {
        id: 2,
        name: "Rohit Verma",
        phone: "9999999999",
        email: "rohit@example.com",
      },
      branch: {
        id: 1,
        name: "Delhi Branch",
        location: "Delhi",
      },
      items: [],
    },
    {
      id: 3,
      quotation_no: "QT338542",
      client_id: 3,
      branch_id: 2,
      total_amount: 2000,
      gst_amount: 360,
      valid_till: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      client: {
        id: 3,
        name: "Priya Singh",
        phone: "8888888888",
        email: "priya@example.com",
      },
      branch: {
        id: 2,
        name: "Noida Branch",
        location: "Noida",
      },
      items: [],
    },
    {
      id: 4,
      quotation_no: "QT338543",
      client_id: 4,
      branch_id: 2,
      total_amount: 2000,
      gst_amount: 360,
      valid_till: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      client: {
        id: 4,
        name: "Karan Mehta",
        phone: "7777777777",
        email: "karan@example.com",
      },
      branch: {
        id: 2,
        name: "Noida Branch",
        location: "Noida",
      },
      items: [],
    },
    {
      id: 5,
      quotation_no: "QT338544",
      client_id: 5,
      branch_id: 3,
      total_amount: 2000,
      gst_amount: 360,
      valid_till: null,
      status: "approved",
      createdAt: new Date().toISOString(),
      client: {
        id: 5,
        name: "Neha Kapoor",
        phone: "6666666666",
        email: "neha@example.com",
      },
      branch: {
        id: 3,
        name: "Gurgaon Branch",
        location: "Gurgaon",
      },
      items: [],
    },
  ];

  const filteredQuotations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return quotations;

    return quotations.filter((q) => {
      const clientName = q.client?.name?.toLowerCase() || "";
      const clientEmail = q.client?.email?.toLowerCase() || "";
      const clientPhone = q.client?.phone?.toLowerCase() || "";
      const quotationNo = q.quotation_no.toLowerCase();

      return (
        quotationNo.includes(query) ||
        clientName.includes(query) ||
        clientEmail.includes(query) ||
        clientPhone.includes(query)
      );
    });
  }, [quotations, search]);

  const handleView = (quotation: Quotation) => {
    console.log("View quotation:", quotation);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          All Quotations Entries
        </h2>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          <Plus size={16} />
          Create Quotation
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[300px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or Client Name..."
            className="w-full rounded-lg border px-4 py-2 pl-10 text-sm outline-none"
          />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm"
        >
          <SlidersHorizontal size={16} />
          Sort by Date / Amount
        </button>
      </div>

      <div className="space-y-3">
        {filteredQuotations.length > 0 ? (
          filteredQuotations.map((q) => (
            <QuotationCard
              key={q.id}
              data={q}
              onView={() => handleView(q)}
            />
          ))
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-4 py-10 text-center">
            <p className="text-[15px] font-semibold text-[#111827]">
              No quotations found
            </p>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Try another search value.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}