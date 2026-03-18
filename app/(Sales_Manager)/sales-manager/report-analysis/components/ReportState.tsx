import { DollarSign, Target, ShoppingCart, Users } from "lucide-react";

export default function ReportState() {

  const StateData = [
    {
      icon: DollarSign,
      trend: "+12.5%",
      trendColor: "text-green-600",
      label: "Total Revenue",
      value: "$328,000",
      bg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Target,
      trend: "-2.1%",
      trendColor: "text-red-500",
      label: "Avg. Order Value",
      value: "$1,395",
      bg: "bg-orange-50",
      iconColor: "text-orange-500"
    },
    {
      icon: ShoppingCart,
      trend: "+8.2%",
      trendColor: "text-green-600",
      label: "Total Orders",
      value: "235",
      bg: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Users,
      trend: "+15.3%",
      trendColor: "text-green-600",
      label: "Active Clients",
      value: "128",
      bg: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
      
      {StateData.map((state, index) => {
        const Icon = state.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 flex justify-between items-center shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            {/* Left Content */}
            <div className="space-y-1">

              <span className={`text-sm font-semibold ${state.trendColor}`}>
                {state.trend}
              </span>

              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {state.value}
              </h3>

              <p className="text-sm text-gray-500 font-medium">
                {state.label}
              </p>
            </div>

            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${state.bg}`}
            >
              <Icon className={`w-6 h-6 ${state.iconColor}`} />
            </div>

          </div>
        );
      })}
    </div>
  );
}