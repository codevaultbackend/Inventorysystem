import { HiOutlineDocumentText } from "react-icons/hi";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsCheckCircle } from "react-icons/bs";
import { IoCloseCircleOutline } from "react-icons/io5";

export default function StatsSection() {
  return (
    <div className="grid grid-cols-4 gap-[20px] mb-[20px]">

      <StatCard
        label="Total Quotations"
        value="0"
        sub="$0.00"
        icon={<HiOutlineDocumentText />}
        bg="bg-[#F4F6F9]"
      />

      <StatCard
        label="Pending Quotations"
        value="0"
        sub="3 this week"
        icon={<AiOutlineClockCircle />}
        bg="bg-[#FFF6E5]"
      />

      <StatCard
        label="Approved Quotations"
        value="96"
        icon={<BsCheckCircle />}
        bg="bg-[#E8F7EF]"
      />

      <StatCard
        label="Rejected Quotations"
        value="0"
        icon={<IoCloseCircleOutline />}
        bg="bg-[#FCEBEC]"
      />

    </div>
  );
}

function StatCard({ label, value, sub, icon, bg }) {
  return (
    <div className="bg-white h-[88px] rounded-[12px] px-[20px] flex items-center justify-between shadow-sm">

      <div>
        {sub && (
          <p className="text-[12px] text-[#22C55E] mb-[2px]">
            {sub}
          </p>
        )}

        <p className="text-[22px] font-[600] text-[#111827]">
          {value}
        </p>

        <p className="text-[13px] text-[#6B7280]">
          {label}
        </p>
      </div>

      <div className={`${bg} w-[42px] h-[42px] rounded-full flex items-center justify-center text-[20px]`}>
        {icon}
      </div>

    </div>
  );
}