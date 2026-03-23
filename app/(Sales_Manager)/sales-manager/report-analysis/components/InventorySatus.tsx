"use client";

type Props = {
  data: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
};

export default function InventoryStatus({ data }: Props) {
  const total = data.inStock + data.lowStock + data.outOfStock;

  const inventory = [
    {
      product: "In Stock",
      stock: total ? (data.inStock / total) * 100 : 0,
      status: "In Stock",
      color: "bg-green-500",
      count: data.inStock,
    },
    {
      product: "Low Stock",
      stock: total ? (data.lowStock / total) * 100 : 0,
      status: "Low Stock",
      color: "bg-yellow-500",
      count: data.lowStock,
    },
    {
      product: "Out of Stock",
      stock: total ? (data.outOfStock / total) * 100 : 0,
      status: "Out of Stock",
      color: "bg-red-500",
      count: data.outOfStock,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-800">
          Inventory Status
        </h3>
      </div>

      <div className="p-6 space-y-5">
        {inventory.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm gap-3">
              <span className="font-medium text-gray-800">
                {item.product} ({item.count})
              </span>

              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.status === "In Stock"
                    ? "bg-green-100 text-green-700"
                    : item.status === "Low Stock"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="w-full h-[8px] bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color}`}
                style={{ width: `${Math.max(item.stock, item.count > 0 ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}