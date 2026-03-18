"use client"

export default function InventoryStatus() {

  const inventory = [
    {
      product: "Laptop Pro X",
      stock: 80,
      status: "In Stock",
      color: "bg-green-500"
    },
    {
      product: "Office Chair Plus",
      stock: 55,
      status: "In Stock",
      color: "bg-green-500"
    },
    {
      product: "Wireless Mouse",
      stock: 35,
      status: "Low Stock",
      color: "bg-yellow-500"
    },
    {
      product: "Standing Desk",
      stock: 20,
      status: "Low Stock",
      color: "bg-yellow-500"
    },
    {
      product: "Noise Cancelling Headphones",
      stock: 10,
      status: "Out of Stock",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-800">
          Inventory Status
        </h3>
      </div>

      {/* Inventory List */}
      <div className="p-6 space-y-5">

        {inventory.map((item, index) => (
          <div key={index} className="space-y-2">

            {/* Product + Status */}
            <div className="flex justify-between items-center text-sm">

              <span className="font-medium text-gray-800">
                {item.product}
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

            {/* Progress Bar */}
            <div className="w-full h-[8px] bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color}`}
                style={{ width: `${item.stock}%` }}
              />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}