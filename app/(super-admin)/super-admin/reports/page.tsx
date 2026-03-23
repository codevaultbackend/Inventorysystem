"use client";

import { useEffect, useMemo, useState } from "react";
import SalesTrendChart from "./components/SalesTrendChart";
import ScrapRepairChart from "./components/ScrapRepairChart";
import TransitDonutChart from "./components/TransitDonutChart";
import ReportsTable from "./components/ReportsTable";
import { useAuth } from "@/app/context/AuthContext";

type TrendChartItem = {
  name: string;
  repairable: number;
  scrap: number;
};

type ScrapChartItem = {
  category: string;
  repairable: number;
  scrap: number;
};

type TransitChartItem = {
  name: string;
  value: number;
  percentage: string | number;
};

type ReportItem = {
  name: string;
  type: string;
  date: string;
  generatedBy: string;
  format: string;
};

type ReportsApiResponse = {
  trendChart: TrendChartItem[];
  scrapChart: ScrapChartItem[];
  transitChart: TransitChartItem[];
  reports: ReportItem[];
};

type ScrapRepairChartRow = {
  name: string;
  repairable: number;
  scrap: number;
};

type TransitDonutChartRow = {
  name: string;
  value: number;
  percentage: number;
};

type ReportsTableRow = {
  name: string;
  type: string;
  date: string;
  generatedBy: string;
  format: string;
};

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export default function Reports() {
  const { user } = useAuth();

  const [data, setData] = useState<ReportsApiResponse>({
    trendChart: [],
    scrapChart: [],
    transitChart: [],
    reports: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        const res = await fetch("/api/sqlbranch/d/report", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Failed to load reports dashboard");
        }

        if (!ignore) {
          setData({
            trendChart: Array.isArray(json?.trendChart) ? json.trendChart : [],
            scrapChart: Array.isArray(json?.scrapChart) ? json.scrapChart : [],
            transitChart: Array.isArray(json?.transitChart)
              ? json.transitChart
              : [],
            reports: Array.isArray(json?.reports) ? json.reports : [],
          });
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message || "Failed to load reports dashboard");
          setData({
            trendChart: [],
            scrapChart: [],
            transitChart: [],
            reports: [],
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchReports();

    return () => {
      ignore = true;
    };
  }, [user?.role, user?.branch_id]);

  const trendChartData: TrendChartItem[] = useMemo(() => {
    return (data?.trendChart || []).map((item) => ({
      name: item?.name || "-",
      repairable: toNumber(item?.repairable),
      scrap: toNumber(item?.scrap),
    }));
  }, [data?.trendChart]);

  const scrapRepairData: ScrapRepairChartRow[] = useMemo(() => {
    return (data?.scrapChart || []).map((item) => ({
      name: item?.category || "-",
      repairable: toNumber(item?.repairable),
      scrap: toNumber(item?.scrap),
    }));
  }, [data?.scrapChart]);

  const transitData: TransitDonutChartRow[] = useMemo(() => {
    return (data?.transitChart || []).map((item, index) => ({
      name: item?.name || `Category ${index + 1}`,
      value: toNumber(item?.value),
      percentage: toNumber(item?.percentage),
    }));
  }, [data?.transitChart]);

  const reportsData: ReportsTableRow[] = useMemo(() => {
    return (data?.reports || []).map((item) => ({
      name: item?.name || "-",
      type: item?.type || "-",
      date: item?.date || "-",
      generatedBy: item?.generatedBy || "-",
      format: item?.format || "-",
    }));
  }, [data?.reports]);

  if (error && !loading) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <SalesTrendChart data={trendChartData} loading={loading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0">
          <ScrapRepairChart data={scrapRepairData} loading={loading} />
        </div>

        <div className="min-w-0">
          <TransitDonutChart data={transitData} loading={loading} />
        </div>
      </div>

      <ReportsTable data={reportsData} loading={loading} />
    </div>
  );
}