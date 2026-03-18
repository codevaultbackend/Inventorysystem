"use client";

import {
  Search,
  Bell,
  MoreHorizontal,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  ShoppingCart,
  FileText,
  Truck,
  FileSpreadsheet,
} from "lucide-react";

export default function Dashboard() {
  const summaryStats = [
    { value: "24", label: "New Clients" },
    { value: "12", label: "Quotations" },
    { value: "4", label: "Follow-ups" },
  ];

  const quickActions = [
    {
      top: "$0.00",
      value: "90%",
      label: "Today’s Sale",
      icon: ShoppingCart,
      topColor: "text-[#22C55E]",
      bubble: "bg-[#DDF1EC]",
      iconColor: "text-[#82CDBB]",
    },
    {
      top: "29 items",
      value: "49,832",
      label: "Total Sale",
      icon: TrendingUp,
      topColor: "text-[#22C55E]",
      bubble: "bg-[#DDE3F7]",
      iconColor: "text-[#8DA3EB]",
    },
    {
      top: "↗ 3 this week",
      value: "$12,396",
      label: "Pending Quotation",
      icon: FileText,
      topColor: "text-[#22C55E]",
      bubble: "bg-[#F8DFD3]",
      iconColor: "text-[#F09F79]",
    },
    {
      top: "↗ On schedule",
      value: "84%",
      label: "Ready to Dispatch",
      icon: Truck,
      topColor: "text-[#22C55E]",
      bubble: "bg-[#F2D8DE]",
      iconColor: "text-[#E88CA0]",
    },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const categoryBars = [
    { label: "Electronics", height: 66 },
    { label: "Audio", height: 82 },
    { label: "Storage", height: 74 },
    { label: "Accessories", height: 52, tooltip: "$70,567" },
    { label: "Audio", height: 78 },
    { label: "Electronics", height: 63 },
    { label: "Storage", height: 49 },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F6F8]">
      <div className="flex w-full">
        {/* MAIN */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1500px]  py-3  sm:py-4 md:px-6 xl:px-7">
            <section className="mb-4 rounded-[18px] bg-[#E7EDF5] p-4 sm:p-5 md:p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {quickActions.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.label}
                      className="relative overflow-hidden rounded-[14px] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5"
                    >
                      <div
                        className={`absolute -right-3 -top-6 h-[110px] w-[110px] rounded-full sm:h-[120px] sm:w-[120px] ${card.bubble}`}
                      />
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`text-[13px] font-[500] sm:text-[14px] ${card.topColor}`}
                          >
                            {card.top}
                          </p>
                          <p className="mt-2 break-words text-[18px] font-[700] text-[#222222] sm:text-[20px]">
                            {card.value}
                          </p>
                          <p className="mt-1 text-[13px] text-[#666666] sm:text-[14px] md:text-[16px]">
                            {card.label}
                          </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm sm:h-12 sm:w-12">
                          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.iconColor}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ANALYTICS + DONUT */}
            <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.95fr_0.95fr]">
              {/* SALES ANALYTICS */}
              <div className="rounded-[18px] border border-[#E7EAF0] bg-white p-4 sm:p-5 md:p-6">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h3 className="text-[18px] font-[700] text-[#111827] sm:text-[20px] md:text-[22px]">
                    Sales Analytics
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-5">
                    <div className="flex items-center gap-2 text-[13px] text-[#111827] sm:text-[14px]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#222A6D]" />
                      Offline orders
                    </div>

                    <div className="flex items-center gap-2 text-[13px] text-[#111827] sm:text-[14px]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ED8603]" />
                      Online orders
                    </div>

                    <button className="flex h-[36px] items-center gap-2 rounded-[10px] border border-[#E8EAF0] bg-white px-3 text-[13px] text-[#334155] shadow-sm sm:h-[38px] sm:px-4 sm:text-[14px]">
                      Monthly
                      <span className="text-[10px]">▼</span>
                    </button>
                  </div>
                </div>

                <div className="relative h-[250px] w-full sm:h-[290px] md:h-[340px]">
                  {/* grid */}
                  <div className="absolute inset-0 left-7 sm:left-8">
                    {[0, 20, 40, 60, 80, 100].map((v, i) => (
                      <div
                        key={v}
                        className="absolute left-0 right-0 border-t border-[#E8EEF7]"
                        style={{ top: `${i * 20}%` }}
                      >
                        <span className="absolute -top-2.5 -left-7 text-[10px] text-[#8CA0C3] sm:-left-8 sm:text-[12px]">
                          {100 - v}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* highlighted bar */}
                  <div className="absolute left-[39%] top-[25%] h-[105px] w-[18px] rounded-[20px] bg-[linear-gradient(180deg,rgba(98,103,135,0.15)_0%,rgba(98,103,135,0.35)_100%)] sm:h-[130px] sm:w-[20px] md:h-[150px] md:w-[24px]" />

                  {/* tooltip */}
                  <div className="absolute left-[27%] top-[16%] rounded-[10px] bg-[#F4F5F9] px-3 py-2 shadow-sm sm:left-[30%] sm:top-[17%] sm:px-4 sm:py-3 md:left-[34.2%] md:top-[18%]">
                    <p className="text-[10px] text-[#8CA0C3] sm:text-[12px]">
                      15 Aug 2022
                    </p>
                    <p className="mt-1 text-[13px] font-[700] text-[#111827] sm:text-[15px] md:text-[16px]">
                      $59,492.10
                    </p>
                  </div>

                  {/* svg lines */}
                  <div className="absolute inset-0 left-7 sm:left-8">
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="h-full w-full"
                    >
                      <path
                        d="M0,72 C8,82 11,60 18,66 C24,72 26,55 33,58 C40,60 40,36 48,45 C55,56 58,40 65,48 C73,60 77,42 84,51 C90,58 94,48 100,45"
                        fill="none"
                        stroke="#ED8603"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0,84 C6,68 12,78 18,72 C23,64 28,80 34,61 C39,48 43,44 49,54 C55,58 57,72 64,61 C70,55 75,69 82,61 C87,57 92,70 100,46"
                        fill="none"
                        stroke="#222A6D"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                      <circle cx="40" cy="55" r="1.2" fill="#222A6D" />
                    </svg>
                  </div>

                  {/* months */}
                  <div className="absolute bottom-0 left-7 right-0 flex justify-between pr-1 text-[10px] text-[#8CA0C3] sm:left-8 sm:pr-2 sm:text-[12px] md:right-4 md:text-[13px]">
                    {months.map((month) => (
                      <span key={month} className="whitespace-nowrap">
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* QUOTATION STATUS */}
              <div className="rounded-[18px] border border-[#E7EAF0] bg-white p-4 sm:p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-[700] text-[#111827] sm:text-[20px] md:text-[22px]">
                    Quotation Status
                  </h3>
                  <button className="shrink-0">
                    <MoreHorizontal className="h-5 w-5 text-[#111827]" />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
                  <div className="relative h-[180px] w-[180px] sm:h-[200px] sm:w-[200px] md:h-[220px] md:w-[220px]">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "conic-gradient(#2D2F78 0deg 145deg, #BFD0FF 145deg 210deg, #F7A72A 210deg 275deg, #8C7BF7 275deg 315deg, #F78B8B 315deg 360deg)",
                      }}
                    />
                    <div className="absolute inset-[30px] rounded-full bg-white shadow-[inset_0_0_0_10px_#F2F4F7] sm:inset-[34px] md:inset-[38px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[20px] font-[700] text-[#4B5563] sm:text-[22px] md:text-[24px]">
                        $452
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 text-[13px] text-[#111827] sm:gap-x-5 sm:text-[14px]">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2D2F78]" />
                      Pending (0)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F7A72A]" />
                      Approved (0)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F78B8B]" />
                      Rejected (0)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CATEGORY + ACTIVITY */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.95fr_0.95fr]">
              {/* SALES BY CATEGORY */}
              <div className="rounded-[18px] border border-[#E7EAF0] bg-white p-4 sm:p-5 md:p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-[18px] font-[700] text-[#343A4A] sm:text-[20px] md:text-[22px]">
                    Sales by Category ( Units Sold )
                  </h3>

                  <button className="flex items-center gap-2 text-[14px] text-[#7C8AA5] sm:text-[16px]">
                    Monthly
                    <span className="text-[10px]">▲</span>
                    <span className="text-[10px]">▼</span>
                  </button>
                </div>

                <div className="relative overflow-x-auto">
                  <div className="relative min-w-[640px] h-[300px]">
                    <div className="absolute left-0 top-0 flex h-[230px] w-[50px] flex-col justify-between text-[12px] text-[#7C8AA5] sm:w-[60px] sm:text-[14px]">
                      <span>80K</span>
                      <span>60K</span>
                      <span>20K</span>
                      <span>0K</span>
                    </div>

                    <div className="ml-[60px] flex h-[230px] items-end justify-between gap-4 sm:ml-[70px] sm:gap-7">
                      {categoryBars.map((item, index) => (
                        <div
                          key={`${item.label}-${index}`}
                          className="relative flex h-full flex-1 flex-col items-center justify-end"
                        >
                          <div className="absolute bottom-0 top-0 w-px bg-[#E8EAF0]" />

                          {item.tooltip ? (
                            <div className="absolute -top-1 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[#4B456A] px-3 py-2 text-[12px] font-[600] text-white shadow-sm sm:px-4 sm:text-[14px]">
                              {item.tooltip}
                            </div>
                          ) : null}

                          <div
                            className="relative z-10 w-[14px] rounded-full bg-[#6E49D4] sm:w-[18px]"
                            style={{ height: `${item.height}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="ml-[60px] mt-7 flex justify-between gap-4 text-center text-[12px] text-[#7C8AA5] sm:ml-[70px] sm:gap-7 sm:text-[14px]">
                      {categoryBars.map((item, index) => (
                        <div
                          key={`${item.label}-label-${index}`}
                          className="flex-1 break-words"
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="rounded-[18px] border border-[#E7EAF0] bg-white">
                <div className="border-b border-[#ECEFF4] px-4 py-4 sm:px-5 sm:py-5 md:px-6">
                  <h3 className="text-[18px] font-[700] text-[#111827] sm:text-[20px] md:text-[22px]">
                    Recent Activity
                  </h3>
                </div>

                <div className="flex h-[280px] flex-col items-center justify-center px-4 text-center sm:h-[320px] sm:px-6 md:h-[360px]">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F8FAFC] sm:h-16 sm:w-16">
                    <FileSpreadsheet className="h-8 w-8 text-[#C7CDD8] sm:h-10 sm:w-10" />
                  </div>

                  <p className="text-[16px] font-[500] text-[#6B7280] sm:text-[18px]">
                    No recent activity
                  </p>
                  <p className="mt-3 text-[14px] text-[#A0AEC0] sm:text-[16px]">
                    Start by adding a new client
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}