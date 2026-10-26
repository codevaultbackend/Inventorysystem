import QuotationCard from "./QuotationCard";

export default function QuotationEntries() {

  const data = [
    { status: "Pending", id: "QT338540" },
    { status: "Rejected", id: "QT338540" },
    { status: "Pending", id: "QT338540" },
    { status: "Pending", id: "QT338540" },
    { status: "Approved", id: "QT338540" },
  ];

  return (
    <div className="bg-white rounded-[12px] shadow-sm p-[20px]">

      <div className="flex justify-between items-center mb-[18px]">

        <h2 className="text-[16px] font-[600] text-[#111827]">
          All Quotations Entries
        </h2>

        <button className="bg-[#111827] text-white text-[13px] px-[14px] py-[8px] rounded-[8px]">
          + Create Quotation
        </button>

      </div>


      <div className="flex justify-between mb-[18px]">

        <input
          placeholder="Search by ID or Client Name..."
          className="border border-[#E5E7EB] rounded-[8px] px-[12px] h-[38px] text-[13px] w-[260px]"
        />

        <button className="border border-[#E5E7EB] rounded-[8px] px-[12px] h-[38px] text-[13px]">
          Sort by Date / Amount
        </button>

      </div>


      <div className="flex flex-col gap-[12px]">
        {data.map((item, index) => (
          <QuotationCard key={index} item={item} />
        ))}
      </div>

    </div>
  );
}