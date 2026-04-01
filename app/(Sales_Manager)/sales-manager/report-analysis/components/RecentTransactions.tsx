"use client";

type TransactionItem = {
  invoice: string;
  client: string;
  amount: number;
  status: string;
};

type Props = {
  data: TransactionItem[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const getStatusStyle = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "approved" || normalized === "paid") {
    return "bg-green-100 text-green-700";
  }

  if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (normalized === "cancelled" || normalized === "rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
};

export default function RecentTransactions({ data }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-h-[325px] overflow-y-auto">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-800">
          Recent Transactions
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
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
            {data.map((txn, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {txn.invoice}
                </td>

                <td className="px-6 py-4 text-gray-700">{txn.client}</td>

                <td className="px-6 py-4 text-gray-600">—</td>

                <td className="px-6 py-4 font-semibold text-gray-900">
                  {formatCurrency(txn.amount)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                      txn.status
                    )}`}
                  >
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}