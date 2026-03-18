"use client"

export default function TopSelling() {

  const products = [
    {
      name: "Laptop Pro X",
      category: "Electronics",
      sales: 120,
      revenue: "$240,000"
    },
    {
      name: "Office Chair Plus",
      category: "Furniture",
      sales: 98,
      revenue: "$98,000"
    },
    {
      name: "Wireless Mouse",
      category: "Accessories",
      sales: 210,
      revenue: "$42,000"
    },
    {
      name: "Standing Desk",
      category: "Furniture",
      sales: 65,
      revenue: "$78,000"
    },
    {
      name: "Noise Cancelling Headphones",
      category: "Electronics",
      sales: 85,
      revenue: "$127,500"
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-800">
          Top Selling Products
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Product</th>
              <th className="text-left px-6 py-3 font-medium">Category</th>
              <th className="text-left px-6 py-3 font-medium">Sales</th>
              <th className="text-left px-6 py-3 font-medium">Revenue</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {products.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">

                <td className="px-6 py-4 font-medium text-gray-800">
                  {product.name}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {product.category}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {product.sales}
                </td>

                <td className="px-6 py-4 font-semibold text-gray-900">
                  {product.revenue}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}