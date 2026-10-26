// ================================
// InventoryCharts.tsx
// ================================

"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PurchaseChartItem = {
  month: string;
  amount: number;
};

type AgingChartItem = {
  name: string;
  value: number;
};

const COLORS = [
  "#3B82F6",
  "#FF5A5F",
  "#7C3AED",
];

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `₹${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }

  return `₹${value}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: any) {
  if (
    active &&
    payload &&
    payload.length
  ) {
    return (
      <div
        className="
          rounded-[14px]
          border
          border-[#EAECF0]
          bg-white
          px-4
          py-3
          shadow-[1px_1px_4px_0px_#0000001A]
        "
      >
        <p className="text-[12px] font-medium text-[#667085]">
          {label}
        </p>

        <p className="mt-1 text-[15px] font-semibold text-[#111827]">
          {formatCurrency(
            payload[0]?.value || 0
          )}
        </p>
      </div>
    );
  }

  return null;
}

export function PurchaseChart({
  data,
}: {
  data: PurchaseChartItem[];
}) {
  return (
    <div
      className="
        h-full
        overflow-hidden
        rounded-[22px]
        border
        border-[#EAECF0]
        bg-white
        p-4
        sm:p-5
        xl:p-6
        shadow-[1px_1px_4px_0px_#0000001A]
      "
    >
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2
          className="
            text-[17px]
            sm:text-[20px]
            font-semibold
            tracking-[-0.4px]
            text-[#111827]
          "
        >
          Purchase Amount Over Time
        </h2>

       
      </div>

      {/* CHART */}
      <div className="h-[240px] sm:h-[290px] xl:h-[320px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: 6,
              left: 0,
              bottom: 0,
            }}
          >
            {/* GRADIENT */}
            <defs>
              <linearGradient
                id="purchaseGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#3B82F6"
                  stopOpacity={0.12}
                />

                <stop
                  offset="100%"
                  stopColor="#3B82F6"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>

            {/* GRID */}
            <CartesianGrid
              vertical={false}
              stroke="#F2F4F7"
              strokeDasharray="3 3"
            />

            {/* X AXIS */}
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{
                fill: "#98A2B3",
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            {/* Y AXIS */}
            <YAxis
              axisLine={false}
              tickLine={false}
              width={56}
              tickMargin={12}
              tickFormatter={(value) =>
                formatCurrency(value)
              }
              tick={{
                fill: "#98A2B3",
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            {/* TOOLTIP */}
            <Tooltip
              cursor={{
                stroke: "#D0D5DD",
                strokeDasharray: "4 4",
              }}
              content={<CustomTooltip />}
            />

            {/* AREA */}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#purchaseGradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 3,
                fill: "#FFFFFF",
                stroke: "#3B82F6",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AgingChart({
  data,
}: {
  data: AgingChartItem[];
}) {
  const total = data.reduce(
    (acc, item) => acc + item.value,
    0
  );

  const hasData = total > 0;

  return (
    <div
      className="
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-[#EAECF0]
        bg-white
        p-4
        sm:p-5
        xl:p-6
        shadow-[1px_1px_4px_0px_#0000001A]
      "
    >
      {/* HEADER */}
      <div className="mb-3">
        <h2
          className="
            text-[17px]
            sm:text-[20px]
            font-semibold
            tracking-[-0.4px]
            text-[#111827]
          "
        >
          Stock Status Overview
        </h2>
      </div>

      {/* DONUT */}
      <div
        className="
          flex
          flex-1
          items-center
          justify-center
          py-2
        "
      >
        <div className="h-[240px] w-full sm:h-[280px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={
                  hasData
                    ? data
                    : [
                        {
                          name: "Empty",
                          value: 1,
                        },
                      ]
                }
                dataKey="value"
                innerRadius={68}
                outerRadius={96}
                paddingAngle={3}
                cornerRadius={6}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {(hasData
                  ? data
                  : [{ value: 1 }]
                ).map(
                  (_item, index) => (
                    <Cell
                      key={index}
                      fill={
                        hasData
                          ? COLORS[index]
                          : "#E5E7EB"
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                ]}
                contentStyle={{
                  borderRadius: 14,
                  border:
                    "1px solid #EAECF0",
                  boxShadow:
                    "0px 4px 14px rgba(16,24,40,0.08)",
                  padding: "10px 14px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LEGEND */}
      <div
        className="
          mt-2
          flex
          flex-wrap
          items-center
          justify-center
          gap-x-5
          gap-y-3
        "
      >
        {data.map((item, index) => (
          <div
            key={item.name}
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                h-[10px]
                w-[10px]
                rounded-[3px]
              "
              style={{
                backgroundColor:
                  COLORS[index],
              }}
            />

            <span
              className="
                text-[13px]
                sm:text-[14px]
                font-medium
                text-[#475467]
              "
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}