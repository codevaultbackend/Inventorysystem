"use client";

export default function AgingAnalysis() {
  const agingData = [
    {
      ageRange: "1 month",
      quantity: "500",
      value: "₹26.10L",
      status: "Good",
    },
    {
      ageRange: "4 months",
      quantity: "550",
      value: "₹26.10L",
      status: "Damaged",
    },
    {
      ageRange: "8 months",
      quantity: "600",
      value: "₹26.10L",
      status: "Good",
    },
    {
      ageRange: "10 months",
      quantity: "500",
      value: "₹26.10L",
      status: "Good",
    },
    {
      ageRange: "1 year",
      quantity: "1K",
      value: "₹26.10L",
      status: "Damaged",
    },
    {
      ageRange: "1.5 years",
      quantity: "100",
      value: "₹26.10L",
      status: "Good",
    },
    {
      ageRange: "2 years",
      quantity: "300",
      value: "₹26.10L",
      status: "Repairable",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Good":
        return "bg-green-100 text-green-600";
      case "Damaged":
        return "bg-red-100 text-red-500";
      case "Repairable":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
      
      {/* SECTION HEADER */}
      <div className="px-6 py-5 border-b">
        <h3 className="text-[16px] font-semibold text-gray-900">
          Aging Analysis
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Remaining life of items
        </p>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          
          {/* TABLE HEADER */}
          <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium">
            <tr>
              <th className="px-6 py-4 !whitespace-nowrap">Age Range</th>
              <th className="px-6 py-4 !whitespace-nowrap">Quantity</th>
              <th className="px-6 py-4 !whitespace-nowrap">Value</th>
              <th className="px-6 py-4 !whitespace-nowrap">Status</th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="text-gray-800">
            {agingData.map((item, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium text-gray-900 border border-[1px]  border-[#E2E2E2]">
                  {item.ageRange}
                </td>

                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.quantity}</td>

                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">{item.value}</td>

                <td className="px-6 py-4 border border-[1px]  border-[#E2E2E2]">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
