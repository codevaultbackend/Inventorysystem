"use client";

import { useEffect, useState } from "react";
import {
  X,
  ChevronDown,
} from "lucide-react";

import {
  searchBranches,
  createBranchTransfer,
} from "./branchTransfer.service";

interface Branch {
  id: number;
  name: string;
  code: string;
  manager_name?: string;
}

interface Props {
  token: string;
  open: boolean;
  onClose: () => void;

  onSuccess: (
    branchClient: any,
    destinationBranch: any,
    poNumber?: string,
    gstNumber?: string
  ) => void;
}

const CATEGORY_OPTIONS = [
  "Inventory Transfer",
  "Quotation Transfer",
  "Sales Transfer",
];

export default function BranchTransferModal({
  token,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [selectedBranchId, setSelectedBranchId] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [remark, setRemark] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [branchesLoading, setBranchesLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) return;

    const loadBranches =
      async () => {
        try {
          setBranchesLoading(true);
          setError("");

          const data =
            await searchBranches(
              "",
              token
            );

          setBranches(
            data?.branches || []
          );
        } catch (err: any) {
          setError(
            err?.message ||
              "Failed to load branches"
          );
        } finally {
          setBranchesLoading(false);
        }
      };

    loadBranches();
  }, [open, token]);

  const resetModal = () => {
    setSelectedBranchId("");
    setSelectedCategory("");
    setRemark("");
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit =
    async () => {
      if (!selectedBranchId) {
        setError(
          "Please select destination branch"
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const payload = {
          to_branch_id:
            Number(selectedBranchId),
          remark:
            remark.trim(),
          category:
            selectedCategory,
        };

        const data =
          await createBranchTransfer(
            payload,
            token
          );

        onSuccess(
          data?.branch_client,
          data?.destination_branch,
          data?.po_number,
          data?.gst_number
        );

        handleClose();
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Transfer failed"
        );
      } finally {
        setLoading(false);
      }
    };

  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-[2px]
        px-4
      "
      onClick={handleClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-[500px]
          rounded-[16px]
          bg-white
          p-6
          shadow-[0_10px_30px_rgba(0,0,0,0.15)]
        "
      >
        <button
          type="button"
          onClick={handleClose}
          className="
            absolute
            right-5
            top-5
            text-[#6B7280]
            hover:text-black
          "
        >
          <X size={20} />
        </button>

        <h2
          className="
            text-[18px]
            font-[600]
            text-[#0A0A0A]
          "
        >
          Smart Branch Inventory Transfers
        </h2>

        <p
          className="
            mt-1
            text-[14px]
            text-[#6B7280]
          "
        >
          Select destination branch
        </p>

        <div className="mt-8">
          <label
            className="
              mb-2
              block
              text-[13px]
              font-[500]
              text-[#111827]
            "
          >
            Select your branch
          </label>

          <div
            className="
              grid
              grid-cols-2
              gap-4
            "
          >
            <div className="relative">
              <select
                value={
                  selectedBranchId
                }
                onChange={(e) =>
                  setSelectedBranchId(
                    e.target.value
                  )
                }
                disabled={
                  branchesLoading
                }
                className="
                  h-[48px]
                  w-full
                  appearance-none
                  rounded-[10px]
                  border
                  border-[#D1D5DB]
                  bg-white
                  px-4
                  pr-10
                  text-[14px]
                  outline-none
                  focus:border-[#2563EB]
                "
              >
                <option value="">
                  {branchesLoading
                    ? "Loading..."
                    : "Select Branch"}
                </option>

                {branches.map(
                  (branch) => (
                    <option
                      key={
                        branch.id
                      }
                      value={
                        branch.id
                      }
                    >
                      {
                        branch.name
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[#6B7280]
                "
              />
            </div>

            <div className="relative">
              <select
                value={
                  selectedCategory
                }
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
                className="
                  h-[48px]
                  w-full
                  appearance-none
                  rounded-[10px]
                  border
                  border-[#D1D5DB]
                  bg-white
                  px-4
                  pr-10
                  text-[14px]
                  outline-none
                  focus:border-[#2563EB]
                "
              >
                <option value="">
                  Category
                </option>

                {CATEGORY_OPTIONS.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {
                        category
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[#6B7280]
                "
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label
            className="
              mb-2
              block
              text-[13px]
              font-[500]
              text-[#111827]
            "
          >
            Additional Notes
          </label>

          <textarea
            value={remark}
            onChange={(e) =>
              setRemark(
                e.target.value
              )
            }
            placeholder="Add any additional information..."
            className="
              h-[72px]
              w-full
              resize-none
              rounded-[10px]
              border-0
              bg-[#F3F4F6]
              p-4
              text-[14px]
              outline-none
            "
          />
        </div>

        {error && (
          <div
            className="
              mt-3
              rounded-lg
              bg-red-50
              p-3
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        <div
          className="
            mt-6
            flex
            gap-3
          "
        >
          <button
            type="button"
            onClick={
              handleClose
            }
            className="
              h-[48px]
              flex-1
              rounded-[8px]
              border
              border-[#D1D5DB]
              bg-white
              text-[14px]
              font-medium
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              loading ||
              !selectedBranchId
            }
            className="
              h-[48px]
              flex-[1.3]
              rounded-[8px]
              bg-[#020826]
              text-[14px]
              font-medium
              text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Processing..."
              : "Create Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
}