import { BsCheckCircleFill } from "react-icons/bs";

export default function ApprovedAlert() {
  return (
    <div className="bg-[#E8F7EF] border border-[#C9EED8] rounded-[10px] p-[16px] flex items-start gap-[10px] mb-[20px]">

      <BsCheckCircleFill className="text-[#22C55E] mt-[2px]" />

      <div>
        <p className="text-[14px] font-[600] text-[#065F46]">
          Quotation Approved Updates
        </p>

        <p className="text-[13px] text-[#065F46] mt-[2px]">
          This quotation has been approved. Invoice has been generated and items have been added to the dispatch queue.
        </p>
      </div>

    </div>
  );
}