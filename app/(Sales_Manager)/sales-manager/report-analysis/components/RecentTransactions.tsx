"use client"

export default function RecentTransactions() {

  const transactions = [
    {
      id: "#TXN-1001",
      client: "John Smith",
      date: "12 Jun 2026",
      amount: "$2,450",
      status: "Paid"
    },
    {
      id: "#TXN-1002",
      client: "Emma Watson",
      date: "11 Jun 2026",
      amount: "$1,200",
      status: "Pending"
    },
    {
      id: "#TXN-1003",
      client: "Michael Brown",
      date: "10 Jun 2026",
      amount: "$3,890",
      status: "Paid"
    },
    {
      id: "#TXN-1004",
      client: "Sophia Johnson",
      date: "09 Jun 2026",
      amount: "$980",
      status: "Cancelled"
    },
    {
      id: "#TXN-1005",
      client: "Daniel Lee",
      date: "08 Jun 2026",
      amount: "$1,760",
      status: "Paid"
    }
  ];

  const getStatusStyle = (status) => {
    if (status === "Paid")
      return "bg-green-100 text-green-700";
    if (status === "Pending")
      return "bg-yellow-100 text-yellow-700";
    if (status === "Cancelled")
      return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-800">
          Recent Transactions
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Transaction ID</th>
              <th className="text-left px-6 py-3 font-medium">Client</th>
              <th className="text-left px-6 py-3 font-medium">Date</th>
              <th className="text-left px-6 py-3 font-medium">Amount</th>
              <th className="text-left px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {transactions.map((txn, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">

                <td className="px-6 py-4 font-medium text-gray-800">
                  {txn.id}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {txn.client}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {txn.date}
                </td>

                <td className="px-6 py-4 font-semibold text-gray-900">
                  {txn.amount}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(txn.status)}`}
                  >
                    {txn.status}
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