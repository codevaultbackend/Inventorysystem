import QuotationCard from "./QuotationCard";

export default function QuotationList() {

  const quotations = [
    { id:"QT338540", status:"Pending", amount:"$2000.00" },
    { id:"QT338540", status:"Rejected", amount:"$2000.00" },
    { id:"QT338540", status:"Pending", amount:"$2000.00" },
    { id:"QT338540", status:"Pending", amount:"$2000.00" },
    { id:"QT338540", status:"Approved", amount:"$2000.00" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800 text-lg">
          All Quotations Entries
        </h2>


    
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
          + Create Quotation
        </button>
      </div>

      <div className="flex justify-between mb-5">

        <input
          placeholder="Search by ID or Client Name..."
          className="border rounded-lg px-4 py-2 w-[300px] text-sm"
        />

        <button className="border px-4 py-2 rounded-lg text-sm">
          Sort by Date / Amount
        </button>

      </div>

      <div className="space-y-3">
        {quotations.map((q, index)=>(
          <QuotationCard key={index} q={q}/>
        ))}
      </div>

    </div>
  );
}