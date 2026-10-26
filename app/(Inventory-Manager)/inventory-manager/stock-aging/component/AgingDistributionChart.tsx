"use client";

import {
  memo,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type PieItem = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: PieItem[];
};

const RADIAN = Math.PI / 180;

function AgingDistributionChart({
  data = [],
}: Props) {
  const chartRef =
    useRef<HTMLDivElement>(null);

  const [chartWidth, setChartWidth] =
    useState(0);

  useEffect(() => {
    const observer =
      new ResizeObserver(
        (entries) => {
          const width =
            entries[0]?.contentRect
              .width || 0;

          setChartWidth(width);
        }
      );

    if (chartRef.current) {
      observer.observe(
        chartRef.current
      );
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const processedData = useMemo(() => {
    return data
      .filter(
        (item) =>
          item &&
          Number(item.value) > 0
      )
      .map((item) => ({
        ...item,
        value: Number(item.value),
      }))
      .sort(
        (a, b) => b.value - a.value
      );
  }, [data]);

  const isMobile =
    chartWidth < 480;

  const outerRadius =
    chartWidth < 360
      ? 55
      : chartWidth < 480
      ? 65
      : 84;

  const innerRadius =
    chartWidth < 360
      ? 35
      : chartWidth < 480
      ? 45
      : 58;

  const chartMargins =
    chartWidth < 480
      ? {
          top: 10,
          right: 10,
          left: 10,
          bottom: 10,
        }
      : {
          top: 10,
          right: 50,
          left: 50,
          bottom: 10,
        };

  const renderCustomLabel = (
    props: any
  ) => {
    const {
      cx,
      cy,
      midAngle,
      outerRadius,
      percent,
      name,
    } = props;

    if (
      percent < 0.04 ||
      isMobile
    ) {
      return null;
    }

    const sin = Math.sin(
      -RADIAN * midAngle
    );

    const cos = Math.cos(
      -RADIAN * midAngle
    );

    const connectorLength = 28;

    const labelRadius =
      outerRadius + 18;

    const sx =
      cx + outerRadius * cos;

    const sy =
      cy + outerRadius * sin;

    const mx =
      cx + labelRadius * cos;

    const my =
      cy + labelRadius * sin;

    const ex =
      mx +
      (cos >= 0
        ? connectorLength
        : -connectorLength);

    const textAnchor =
      cos >= 0 ? "start" : "end";

    const safeLabel =
      name.length > 14
        ? `${name.slice(
            0,
            12
          )}…`
        : name;

    return (
      <g>
        <path
          d={`M${sx},${sy} L${mx},${my} L${ex},${my}`}
          stroke="#D0D5DD"
          strokeWidth={1.25}
          fill="none"
          strokeLinecap="round"
        />

        <text
          x={
            ex +
            (cos >= 0 ? 5 : -5)
          }
          y={my}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fill="#667085"
          fontSize={11}
          fontWeight={600}
        >
          {safeLabel}:{" "}
          {Math.round(
            percent * 100
          )}
          %
        </text>
      </g>
    );
  };

  if (!processedData.length) {
    return (
      <div
        className="
          flex
          min-h-[265px]
          items-center
          justify-center
          rounded-[28px]
          border
          border-[#EAECF0]
          bg-white
          p-5
          shadow-[1px_1px_4px_0px_#0000001A]
        "
      >
        <p
          className="
            text-[14px]
            font-[500]
            text-[#98A2B3]
          "
        >
          No distribution data
          available
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-[28px]
        border
        border-[#EAECF0]
        bg-white
        p-5
        shadow-[1px_1px_4px_0px_#0000001A]
      "
    >
      <div>
        <h3
          className="
            text-[14px]
            font-[500]
            leading-[100%]
            text-[#000000]
          "
        >
          Aging Distribution
        </h3>

        <p
          className="
            mt-1
            text-[11px]
            font-[400]
            leading-[20px]
            text-[#99A1AF]
          "
        >
          Stock breakdown by age
          groups
        </p>
      </div>

      <div
        ref={chartRef}
        className="
          mt-2
          h-[265px]
          sm:h-[300px]
          w-full
        "
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart
            margin={chartMargins}
          >
            <Tooltip
              formatter={(
                value: any,
                _: any,
                payload: any
              ) => [
                `${value}`,
                payload.payload.name,
              ]}
              wrapperStyle={{
                zIndex: 9999,
              }}
              contentStyle={{
                borderRadius: 16,
                border:
                  "1px solid #EAECF0",
                background:
                  "rgba(255,255,255,0.98)",
                boxShadow:
                  "0px 10px 30px rgba(15,23,42,0.10)",
                padding:
                  "10px 14px",
              }}
            />

            <Pie
              data={processedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={
                innerRadius
              }
              outerRadius={
                outerRadius
              }
              paddingAngle={5}
              cornerRadius={12}
              stroke="#fff"
              strokeWidth={4}
              labelLine={false}
              label={
                processedData.length <=
                6
                  ? renderCustomLabel
                  : false
              }
              isAnimationActive
              animationDuration={500}
            >
              {processedData.map(
                (
                  entry,
                  index
                ) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.color
                    }
                  />
                )
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {isMobile && (
        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-x-4
            gap-y-2
          "
        >
          {processedData.map(
            (item) => (
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
                    h-3
                    w-3
                    rounded-full
                    shrink-0
                  "
                  style={{
                    backgroundColor:
                      item.color,
                  }}
                />

                <span
                  className="
                    text-xs
                    text-[#667085]
                  "
                >
                  {item.name}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default memo(
  AgingDistributionChart
);