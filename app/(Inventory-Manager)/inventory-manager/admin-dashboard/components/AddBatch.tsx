"use client";

import {
  Loader2,
  X,
  CalendarDays,
} from "lucide-react";

type Props = {
  open: boolean;

  onClose: () => void;

  batchForm: any;

  setBatchForm: React.Dispatch<
    React.SetStateAction<any>
  >;

  creatingBatch: boolean;

  handleCreateBatch: () => void;

  batchError: string;

  batchSuccess: string;
};

export default function AddBatch({
  open,
  onClose,
  batchForm,
  setBatchForm,
  creatingBatch,
  handleCreateBatch,
  batchError,
  batchSuccess,
}: Props) {

  /**
   * FIX:
   * Modal should not render if closed
   */
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-4 py-5 backdrop-blur-[3px] animate-in fade-in duration-200">

      <div className="relative w-full max-w-[620px] overflow-hidden rounded-[32px] bg-white shadow-[1px_1px_4px_0px_#0000001A] animate-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="border-b border-[#EEF2F7] px-6 py-5 sm:px-7">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h2 className="text-[24px] font-[700] tracking-[-0.03em] text-[#111827]">
                Add New Batch
              </h2>

              <p className="mt-1 text-[14px] font-[500] text-[#667085]">
                Fill batch details to create inventory entry
              </p>
            </div>

            {/* FIXED CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#F8FAFC] text-[#667085] transition-all hover:bg-[#EEF2F7]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 sm:px-7">

          {/* SUCCESS */}
          {batchSuccess ? (
            <div className="mb-5 rounded-[16px] border border-green-200 bg-green-50 px-4 py-3 text-[14px] font-[600] text-green-700">
              {batchSuccess}
            </div>
          ) : null}

          {/* ERROR */}
          {batchError ? (
            <div className="mb-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-[600] text-red-700">
              {batchError}
            </div>
          ) : null}

          {/* FORM */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* BATCH NUMBER */}
            <div>

              <label className="mb-2 block text-[14px] font-[600] text-[#111827]">
                Batch Number
              </label>

              <input
                value={batchForm.batch_no}
                onChange={(e) =>
                  setBatchForm((prev: any) => ({
                    ...prev,
                    batch_no: e.target.value,
                  }))
                }
                placeholder="Enter batch number"
                className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[14px] font-[500] text-[#111827] outline-none transition-all focus:border-[#2563EB]"
              />
            </div>

            {/* RECEIVED QTY */}
            <div>

              <label className="mb-2 block text-[14px] font-[600] text-[#111827]">
                Received Qty.
              </label>

              <input
                type="number"
                value={batchForm.received_qty}
                onChange={(e) =>
                  setBatchForm((prev: any) => ({
                    ...prev,
                    received_qty: e.target.value,
                  }))
                }
                placeholder="Enter quantity"
                className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[14px] font-[500] text-[#111827] outline-none transition-all focus:border-[#2563EB]"
              />
            </div>

            {/* UNIT PRICE */}
            <div>

              <label className="mb-2 block text-[14px] font-[600] text-[#111827]">
                Unit Price
              </label>

              <input
                type="number"
                value={batchForm.unit_price}
                onChange={(e) =>
                  setBatchForm((prev: any) => ({
                    ...prev,
                    unit_price: e.target.value,
                  }))
                }
                placeholder="Enter unit price"
                className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[14px] font-[500] text-[#111827] outline-none transition-all focus:border-[#2563EB]"
              />
            </div>

            {/* DATE */}
            <div>

              <label className="mb-2 block text-[14px] font-[600] text-[#111827]">
                Received Date
              </label>

              <div className="relative">

                <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                <input
                  type="date"
                  value={batchForm.received_date}
                  onChange={(e) =>
                    setBatchForm((prev: any) => ({
                      ...prev,
                      received_date: e.target.value,
                    }))
                  }
                  className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] pl-11 pr-4 text-[14px] font-[500] text-[#111827] outline-none transition-all focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* CONDITION */}
            <div>

              <label className="mb-2 block text-[14px] font-[600] text-[#111827]">
                Condition
              </label>

              <select
                value={batchForm.condition}
                onChange={(e) =>
                  setBatchForm((prev: any) => ({
                    ...prev,
                    condition: e.target.value,
                  }))
                }
                className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[14px] font-[500] text-[#111827] outline-none transition-all focus:border-[#2563EB]"
              >
                <option value="GOOD">Good</option>
                <option value="DAMAGED">Damaged</option>
                <option value="REPAIRABLE">Repairable</option>
                <option value="LOW_STOCK">Low Stock</option>
              </select>
            </div>

            {/* SUPPLIER */}
            <div>

              <label className="mb-2 block text-[14px] font-[600] text-[#111827]">
                Supplier
              </label>

              <input
                value={batchForm.supplier}
                onChange={(e) =>
                  setBatchForm((prev: any) => ({
                    ...prev,
                    supplier: e.target.value,
                  }))
                }
                placeholder="Enter supplier"
                className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[14px] font-[500] text-[#111827] outline-none transition-all focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="flex h-[52px] items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white px-7 text-[15px] font-[600] text-[#344054] transition-all hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={creatingBatch}
              onClick={handleCreateBatch}
              className="flex h-[52px] items-center justify-center gap-2 rounded-[16px] bg-[#020617] px-8 text-[15px] font-[700] text-white shadow-[0px_14px_34px_rgba(2,6,23,0.24)] transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >

              {creatingBatch && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {creatingBatch
                ? "Creating..."
                : "Create Batch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}