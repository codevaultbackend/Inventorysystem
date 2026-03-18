"use client";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleCheckBig,
  CircleX,
  DollarSign,
  XCircle,
} from "lucide-react";
import type {
  ClientFormData,
  CreatedClient,
  DecisionModalType,
  Product,
  WorkflowStage,
} from "./ClientIntakePage";

type Props = {
  stage: Exclude<WorkflowStage, "builder">;
  decisionModal: DecisionModalType;
  setDecisionModal: (value: DecisionModalType) => void;
  onConfirmDecision: () => void;
  clientData: ClientFormData;
  createdClient: CreatedClient | null;
  products: Product[];
  total: number;
  quotationNo: string;
  quotationCreatedAt: string;
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function DecisionConfirmModal({
  type,
  onClose,
  onConfirm,
}: {
  type: Exclude<DecisionModalType, null>;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isApprove = type === "approve";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4">
      <div className="w-full max-w-[430px] rounded-[14px] bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
        <h3 className="text-[18px] font-[700] text-[#111827]">
          {isApprove ? "Approve Quotation" : "Reject Quotation"}
        </h3>

        <p className="mt-3 text-[14px] leading-[22px] text-[#4B5563]">
          {isApprove
            ? "Are you sure you want to approve this quotation? This action will deduct inventory stock, update the sales ledger, generate an invoice, and add to the dispatch queue."
            : "Are you sure you want to reject this quotation? This action cannot be undone."}
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white px-5 text-[14px] font-[500] text-[#111827]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`h-[40px] rounded-[10px] px-5 text-[14px] font-[600] text-white ${
              isApprove ? "bg-[#0CAD39]" : "bg-[#F40000]"
            }`}
          >
            {isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuotationStep({
  stage,
  decisionModal,
  setDecisionModal,
  onConfirmDecision,
  clientData,
  createdClient,
  products,
  total,
  quotationNo,
  quotationCreatedAt,
}: Props) {
  if (stage === "decision") {
    return (
      <>
        <div className="flex w-full justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="w-full rounded-[28px] border border-[#0F172A] bg-white px-6 py-8 shadow-[0_12px_32px_rgba(0,0,0,0.22)] md:px-10 md:py-10 xl:px-14">
            <h2 className="text-[28px] font-[700] leading-[1.15] text-[#0F172A] md:text-[34px]">
              Client Decision
            </h2>

            <p className="mt-10 text-[22px] font-[400] leading-[1.45] text-[#4B5563] md:text-[32px]">
              This quotation is awaiting client approval. Once approved, the
              system will automatically:
            </p>

            <div className="mt-14 space-y-5 pl-4 md:space-y-7 md:pl-12">
              <p className="text-[22px] leading-[1.2] text-[#4B5563] md:text-[30px]">
                Deduct inventory stock
              </p>
              <p className="text-[22px] leading-[1.2] text-[#4B5563] md:text-[30px]">
                Update the sales ledger
              </p>
              <p className="text-[22px] leading-[1.2] text-[#4B5563] md:text-[30px]">
                Generate an invoice
              </p>
              <p className="text-[22px] leading-[1.2] text-[#4B5563] md:text-[30px]">
                Add to dispatch queue
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => setDecisionModal("approve")}
                className="flex h-[80px] items-center justify-center gap-4 rounded-[24px] bg-[#06AE38] text-[26px] font-[500] text-white md:h-[90px] md:text-[34px]"
              >
                <CircleCheckBig className="h-10 w-10 md:h-12 md:w-12" />
                Approve Quotation
              </button>

              <button
                type="button"
                onClick={() => setDecisionModal("reject")}
                className="flex h-[80px] items-center justify-center gap-4 rounded-[24px] bg-[#F40000] text-[26px] font-[500] text-white md:h-[90px] md:text-[34px]"
              >
                <CircleX className="h-10 w-10 md:h-12 md:w-12" />
                Reject Quotation
              </button>
            </div>
          </div>
        </div>

        {decisionModal ? (
          <DecisionConfirmModal
            type={decisionModal}
            onClose={() => setDecisionModal(null)}
            onConfirm={onConfirmDecision}
          />
        ) : null}
      </>
    );
  }

  const approved = stage === "approved";
  const quoteStatusText = approved ? "approved" : "rejected";

  return (
    <>
      <div className="flex w-full justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div
          className={`w-full max-w-[980px] rounded-[18px] border p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8 ${
            approved
              ? "border-[#DEE4EC] bg-white"
              : "border-[#3B3B3B] bg-[#8F8F8F]/90"
          }`}
        >
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2
                className={`text-[22px] font-[700] sm:text-[28px] ${
                  approved ? "text-[#111827]" : "text-[#0F172A]"
                }`}
              >
                {quotationNo}
              </h2>

              <p
                className={`mt-1 text-[14px] ${
                  approved ? "text-[#6B7280]" : "text-[#4B5563]"
                }`}
              >
                Quotation Details
              </p>
            </div>

            <div
              className={`flex h-[32px] w-fit items-center gap-2 rounded-[10px] px-4 text-[14px] font-[500] ${
                approved
                  ? "bg-[#DDF5E4] text-[#15803D]"
                  : "bg-[#FDE4E4] text-[#DC2626]"
              }`}
            >
              {approved ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {approved ? "Approved" : "Rejected"}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2563EB]" />
                <span className="text-[14px] font-[700] text-[#111827]">
                  Client Information
                </span>
              </div>

              <p className="text-[16px] font-[600] text-[#111827]">
                {createdClient?.company_name || clientData.companyName}
              </p>

              <p className="mt-1 text-[14px] text-[#6B7280]">
                Client ID: {createdClient?.client_code || "-"}
              </p>
            </div>

            <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                <span className="text-[14px] font-[700] text-[#111827]">
                  Quote Details
                </span>
              </div>

              <p className="text-[14px] text-[#6B7280]">
                Created: {quotationCreatedAt}
              </p>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Status: {quoteStatusText}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white">
            <div className="border-b border-[#EEF2F7] px-5 py-4">
              <h3 className="text-[16px] font-[700] text-[#111827]">
                Products
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-5 py-4 text-left text-[13px] font-[700] text-[#111827]">
                      Product
                    </th>
                    <th className="px-5 py-4 text-left text-[13px] font-[700] text-[#111827]">
                      Specifications
                    </th>
                    <th className="px-5 py-4 text-center text-[13px] font-[700] text-[#111827]">
                      Quantity
                    </th>
                    <th className="px-5 py-4 text-center text-[13px] font-[700] text-[#111827]">
                      Unit Price
                    </th>
                    <th className="px-5 py-4 text-right text-[13px] font-[700] text-[#111827]">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const quantity = Number(product.quantity || 0);
                    const price = Number(product.price || 0);
                    const subtotal = quantity * price;

                    return (
                      <tr key={product.id} className="border-t border-[#EEF2F7]">
                        <td className="px-5 py-4 text-[14px] text-[#374151]">
                          {product.name || "-"}
                        </td>
                        <td className="px-5 py-4 text-[14px] text-[#6B7280]">
                          {product.specs || "-"}
                        </td>
                        <td className="px-5 py-4 text-center text-[14px] text-[#374151]">
                          {quantity}
                        </td>
                        <td className="px-5 py-4 text-center text-[14px] text-[#374151]">
                          {formatMoney(price)}
                        </td>
                        <td className="px-5 py-4 text-right text-[14px] font-[600] text-[#374151]">
                          {formatMoney(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-[#EEF2F7] px-5 py-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[#374151]" />
                <span className="text-[16px] font-[700] text-[#111827]">
                  Total:
                </span>
                <span className="text-[20px] font-[700] text-[#2563EB]">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 rounded-[12px] border px-5 py-5 ${
              approved
                ? "border-[#B7E4C7] bg-[#EAF8EE]"
                : "border-[#F7C7C7] bg-[#FDEEEE]"
            }`}
          >
            <div className="flex items-start gap-3">
              {approved ? (
                <CheckCircle2 className="mt-[2px] h-5 w-5 text-[#16A34A]" />
              ) : (
                <XCircle className="mt-[2px] h-5 w-5 text-[#DC2626]" />
              )}

              <div>
                <p
                  className={`text-[14px] font-[700] ${
                    approved ? "text-[#166534]" : "text-[#B91C1C]"
                  }`}
                >
                  {approved ? "Quotation Approved" : "Quotation Rejected"}
                </p>

                <p
                  className={`mt-1 text-[14px] leading-[22px] ${
                    approved ? "text-[#166534]" : "text-[#B91C1C]"
                  }`}
                >
                  {approved
                    ? "This quotation has been approved. Invoice has been generated and items have been added to the dispatch queue."
                    : "This quotation has been rejected. You can create a new quotation with revised requirements."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {decisionModal ? (
        <DecisionConfirmModal
          type={decisionModal}
          onClose={() => setDecisionModal(null)}
          onConfirm={onConfirmDecision}
        />
      ) : null}
    </>
  );
}