"use client";

import { useRouter } from "next/navigation";
import { Package, AlertTriangle, Wrench, Boxes } from "lucide-react";

import StockCount from "../../Components/StockCounts";
import BranchShareChart from "./component/BranchShareChart";
import CashflowChart from "./component/CashflowChart";
import LedgerTable from "./component/LedgerTable";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  cards?: {
    totalStockValue?: number | string;
    totalGoodStock?: number | string;
    repairableStock?: number | string;
    damagedStock?: number | string;
  };
  monthlyCashflow?: Array<{
    month?: string;
    amount?: number | string;
  }>;
  categoryDistribution?: Array<{
    category?: string;
    total?: number | string;
  }>;
  clients?: Array<{
    id?: number | string;
    clientCode?: string;
    vendorName?: string;
    email?: string;
    phone?: string;
    gstNumber?: string;
    totalAmount?: number | string;
    pendingAmount?: number | string;
  }>;
};

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatMoney(value: unknown) {
  return `₹${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function LedgerScreen() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ims-swp9.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();
        if (!token) throw new Error("No token found");

        const res = await axios.get(`${API_BASE}/combine/dashboard/complete`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.success) {
          setDashboard(res.data.dashboard || null);
        } else {
          throw new Error(res.data?.message || "Invalid API response");
        }
      } catch (err: any) {
        console.error(err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        setError(message);

        if (err?.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("ims_token");
          localStorage.removeItem("imsToken");
          localStorage.removeItem("jwt");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] max-w-[1440px] w-full">
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
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

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 h-5 w-40 rounded bg-[#E5E7EB]" />

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      {Array.from({ length: 7 }).map((_, index) => (
                        <th key={index} className="px-4 py-3 text-left">
                          <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-[#F1F5F9] last:border-b-0"
                      >
                        {Array.from({ length: 7 }).map((_, colIndex) => (
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

  const counts = {
    total: toNumber(dashboard.cards?.totalStockValue),
    low: toNumber(dashboard.cards?.totalGoodStock),
    scrap: toNumber(dashboard.cards?.repairableStock),
    transit: toNumber(dashboard.cards?.damagedStock),
  };

  const cashflowData = (dashboard.monthlyCashflow || []).map((item: any) => ({
    month: item?.month || "",
    amount: toNumber(item?.amount),
  }));

  const total = (dashboard.categoryDistribution || []).reduce(
    (sum: number, item: any) => sum + toNumber(item?.total),
    0
  );

  const branchShareData = (dashboard.categoryDistribution || []).map(
    (item: any) => ({
      name: item?.category || "Unknown",
      value: total > 0 ? Math.round((toNumber(item?.total) / total) * 100) : 0,
    })
  );

  const tableData = (dashboard.clients || []).map((item: any) => ({
    id: item?.id,
    vendor: item?.vendorName || "-",
    email: item?.email || "-",
    phone: item?.phone || "-",
    amount: formatMoney(item?.totalAmount),
    pending: formatMoney(item?.pendingAmount),
    gst: item?.gstNumber || "-",
    action: "View",
  }));

  return (
    <div className="min-h-screen bg-[#F4F6F9] max-w-[1440px] w-full">
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StockCount
            title="Total Stock Items"
            value={counts.total}
            icon={Boxes}
          />
          <StockCount
            title="Low Stock Items"
            value={counts.low}
            icon={AlertTriangle}
          />
          <StockCount
            title="Scrap Items"
            value={counts.scrap}
            icon={Wrench}
          />
          <StockCount
            title="Transit Items"
            value={counts.transit}
            icon={Package}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[442px] max-h-[442px] w-full">
            <div className="w-full h-full overflow-hidden">
              <CashflowChart data={cashflowData} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[442px] max-h-[442px] w-full">
            <div className="w-full h-full overflow-hidden">
              <BranchShareChart data={branchShareData} />
            </div>
          </div>
        </div>

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
                { key: "action", label: "Action" },
              ]}
              data={tableData}
              onView={(row) => {
                if (!row?.id) return;
                router.push(`/inventory-manager/ledger/${row.id}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}