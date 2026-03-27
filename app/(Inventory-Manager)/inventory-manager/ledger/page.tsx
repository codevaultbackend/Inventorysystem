"use client";

import { useParams, useRouter } from "next/navigation";
import { Package, AlertTriangle, Wrench, Boxes } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";

import StockCategoryBarChart from "../../Components/StockCategoryBarChart";
import StockCount from "../../Components/StockCounts";
import StockLineChart from "../../Components/StockLineChart";
import StockInventoryTable from "../../Components/StockInventoryTable";
import BranchShareChart from "./component/BranchShareChart";
import CashflowChart from "./component/CashflowChart";
import LedgerTable from "./component/LedgerTable";

import axios from "axios";
import { useEffect, useState } from "react";

export default function LedgerScreen() {
  const params = useParams();
  const router = useRouter();
  const stateId = params?.stateId as string;

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatState = (text: string) => {
    return text?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  /* ================= API ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get(
          "https://ims-swp9.onrender.com/combine/dashboard/complete",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success) {
          setDashboard(res.data.dashboard);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= FALLBACK ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] max-w-[1440px] w-full">
        <div className="space-y-6 animate-pulse">
          {/* KPI CARDS SKELETON */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-28 rounded bg-[#E5E7EB]" />
                    <div className="h-8 w-20 rounded bg-[#E5E7EB]" />
                    <div className="h-3 w-16 rounded bg-[#E5E7EB]" />
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-[#E5E7EB]" />
                </div>
              </div>
            ))}
          </div>

          {/* CHART SKELETON */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_3fr]">
            <div className="h-[442px] w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 space-y-2">
                <div className="h-5 w-40 rounded bg-[#E5E7EB]" />
                <div className="h-4 w-56 rounded bg-[#E5E7EB]" />
              </div>
              <div className="h-[340px] w-full rounded-[18px] bg-[#E5E7EB]" />
            </div>

            <div className="h-[442px] w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 space-y-2">
                <div className="h-5 w-32 rounded bg-[#E5E7EB]" />
                <div className="h-4 w-44 rounded bg-[#E5E7EB]" />
              </div>
              <div className="h-[340px] w-full rounded-[18px] bg-[#E5E7EB]" />
            </div>
          </div>

          {/* TABLE SKELETON */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 h-5 w-40 rounded bg-[#E5E7EB]" />

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      {[...Array(7)].map((_, index) => (
                        <th key={index} className="px-4 py-3 text-left">
                          <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-[#F1F5F9] last:border-b-0"
                      >
                        {[...Array(7)].map((_, colIndex) => (
                          <td key={colIndex} className="px-4 py-4">
                            <div className="h-4 w-full max-w-[120px] rounded bg-[#E5E7EB]" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!dashboard) return null;

  /* ================= DATA MAPPING ================= */

  const counts = {
    total: Number(dashboard.cards.totalStockValue),
    low: Number(dashboard.cards.totalGoodStock),
    scrap: Number(dashboard.cards.repairableStock),
    transit: Number(dashboard.cards.damagedStock),
  };

  const cashflowData = dashboard.monthlyCashflow.map((item: any) => ({
    month: item.month,
    amount: Number(item.amount),
  }));

  const total = dashboard.categoryDistribution.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );

  const branchShareData = dashboard.categoryDistribution.map((item: any) => ({
    name: item.category,
    value: Math.round((item.total / total) * 100),
  }));

  const tableData = dashboard.clients.map((item: any) => ({
    vendor: item.vendorName,
    email: item.email,
    phone: item.phone,
    amount: `₹${item.totalAmount}`,
    pending: `₹${item.pendingAmount}`,
    gst: item.gstNumber,
  }));

  /* ================= ORIGINAL UI (UNCHANGED) ================= */

  return (
    <div className="min-h-screen bg-[#F4F6F9] max-w-[1440px] w-full">
      <div className=" space-y-6">
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StockCount title="Total Stock Items" value={counts.total} icon={Boxes} />
          <StockCount title="Low Stock Items" value={counts.low} icon={AlertTriangle} />
          <StockCount title="Scrap Items" value={counts.scrap} icon={Wrench} />
          <StockCount title="Transit Items" value={counts.transit} icon={Package} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
          {/* CASHFLOW CHART */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[442px] max-h-[442px] w-full">
            <div className="w-full h-full overflow-hidden">
              <CashflowChart data={cashflowData} />
            </div>
          </div>

          {/* BRANCH SHARE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[442px] max-h-[442px] w-full">
            <div className="w-full h-full overflow-hidden">
              <BranchShareChart data={branchShareData} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <LedgerTable
              columns={[
                { key: "vendor", label: "Vendor Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "amount", label: "Total Amount" },
                { key: "pending", label: "Pending Amount" },
                { key: "gst", label: "GST Number" },
              ]}
              data={tableData}
              onView={(row) => console.log(row)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}