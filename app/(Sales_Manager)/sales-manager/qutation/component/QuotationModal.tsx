import { Quotation } from "../page";

interface Props {
  quote: Quotation;
  onClose: () => void;
}

export default function QuotationModal({ quote, onClose }: Props) {

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-xl w-full max-w-[900px] p-8">
        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-[22px] font-semibold text-[#111827]">
              {quote.id}
            </h1>

            <p className="text-[13px] text-[#6B7280]">
              Quotation Details
            </p>
          </div>

          <span className="bg-[#DCFCE7] text-[#15803D] text-[12px] px-3 py-[4px] rounded-full">
            {quote.status}
          </span>

        </div>

        {/* Info */}

        <div className="grid grid-cols-2 gap-4 mb-6">

          <div className="border rounded-lg p-4">

            <p className="font-semibold text-[14px] mb-2">
              Client Information
            </p>

            <p className="text-[13px]">athratech</p>

            <p className="text-[12px] text-[#9CA3AF]">
              Client ID: CL454632
            </p>

          </div>


          <div className="border rounded-lg p-4">

            <p className="font-semibold text-[14px] mb-2">
              Quote Details
            </p>

            <p className="text-[13px]">
              Created: 21/02/2026
            </p>

            <p className="text-[12px] text-[#9CA3AF]">
              Status: {quote.status}
            </p>

          </div>

        </div>

        {/* Table */}

        <div className="border rounded-lg p-4">

          <table className="w-full text-[13px]">

            <thead className="border-b text-[#6B7280]">
              <tr>
                <th className="text-left py-2">Product</th>
                <th className="text-left">Specifications</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-3">pump</td>
                <td>dfghjklrtyuio</td>
                <td className="text-center">1</td>
                <td className="text-center">$2000.00</td>
                <td className="text-center">$2000.00</td>
              </tr>
            </tbody>

          </table>

          <div className="flex justify-end mt-4 font-semibold">
            Total: $2000.00
          </div>

        </div>

        <div className="flex justify-end mt-6">

          <button
            onClick={onClose}
            className="bg-black text-white px-4 py-2 rounded-lg text-[13px]"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}