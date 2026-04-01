"use client";

type ProductItem = {
  product_name: string;
  sales: number;
  revenue: number;
};

type Props = {
  data: ProductItem[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export default function TopSelling({ data }: Props) {
  return (
    <div className="bg-white max-h-[325px] overflow-y-auto border border-gray-200 rounded-xl shadow-sm w-full">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-800">
          Top Selling Products
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Product</th>
              <th className="text-left px-6 py-3 font-medium">Category</th>
              <th className="text-left px-6 py-3 font-medium">Sales</th>
              <th className="text-left px-6 py-3 font-medium">Revenue</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {product.product_name}
                </td>

                <td className="px-6 py-4 text-gray-600">General</td>

                <td className="px-6 py-4 text-gray-700">{product.sales}</td>

                <td className="px-6 py-4 font-semibold text-gray-900">
                  {formatCurrency(product.revenue)}
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No product data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}