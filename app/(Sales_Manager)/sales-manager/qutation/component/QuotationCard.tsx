import { Quotation } from "../page";

interface Props {
  data: Quotation;
  onView: () => void;
}

export default function QuotationCard({ data, onView }: Props) {

  const statusStyle = {
    Pending: "bg-[#FEF3C7] text-[#B45309]",
    Approved: "bg-[#DCFCE7] text-[#15803D]",
    Rejected: "bg-[#FEE2E2] text-[#B91C1C]",
  };

  return (
    <div className="border border-[#EEF2F7] rounded-lg p-4 flex justify-between items-center">

      <div>

        <div className="flex items-center gap-2">

          <p className="text-[14px] font-semibold text-[#111827]">
            {data.id}
          </p>

          <span
            className={`text-[11px] px-2 py-[2px] rounded-full ${statusStyle[data.status]}`}
          >
            {data.status}
          </span>

        </div>

        <p className="text-[12px] text-[#6B7280] mt-1">
          athratech
        </p>

        <p className="text-[11px] text-[#9CA3AF]">
          Created: 21/02/2026, 13:22:18
        </p>

      </div>


      <div className="flex items-center gap-6">

        <div>
          <p className="text-[11px] text-[#9CA3AF]">
            Total Amount
          </p>

          <p className="text-[15px] font-semibold text-[#111827]">
            $2000.00
          </p>
        </div>

        <button
          onClick={onView}
          className="bg-[#2563EB] text-white px-4 py-[6px] text-[12px] rounded-md"
        >
          View
        </button>

      </div>

    </div>
  );
}