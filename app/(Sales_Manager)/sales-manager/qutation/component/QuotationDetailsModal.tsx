export default function QuotationDetails(){

  return(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl p-8 w-[900px]">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">
            QT481247
          </h1>

          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            Approved
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">

          <div className="border rounded-lg p-4">
            <p className="font-semibold">Client Information</p>
            <p className="text-sm mt-2">athratech</p>
            <p className="text-xs text-gray-400">
              Client ID: CL454632
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="font-semibold">Quote Details</p>
            <p className="text-sm mt-2">
              Created: 21/02/2026
            </p>
            <p className="text-xs text-gray-400">
              Status: approved
            </p>
          </div>

        </div>

        <div className="border rounded-lg p-4">

          <table className="w-full text-sm">

            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Specifications</th>
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
                <td className="text-center">$2000</td>
                <td className="text-center">$2000</td>
              </tr>
            </tbody>

          </table>

          <div className="flex justify-end mt-4 font-semibold">
            Total: $2000
          </div>

        </div>

      </div>

    </div>
  )
}