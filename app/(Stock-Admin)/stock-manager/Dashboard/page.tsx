
"use client";

import { Users, Package, AlertTriangle, TrendingUp } from "lucide-react";
import StockCount from "../../Components/StockCounts";
import StockLineChart from "../../Components/StockLineChart";
import StockCategoryBarChart from "../../Components/StockCategoryBarChart";
import StockInventoryTable from "../../Components/StockInventoryTable";
import { useSuperStockAdmin } from "@/app/context/SuperStockAdminContext";

export default function Dashboard() {
    const { data, loading, error, refresh } = useSuperStockAdmin();

    const columns = [
        { key: "branch", label: "Branch Name" },
        { key: "category", label: "Category" },
        { key: "hsn", label: "HSN Code" },
        { key: "current", label: "Current Stock" },
        { key: "stockIn", label: "Stock IN" },
        { key: "stockOut", label: "Stock OUT" },
        { key: "condition", label: "Condition" },
        { key: "action", label: "Action" },
    ];


    const pieData = [
        { name: "Current Stock", value: 4800, color: "#2563EB" },
        { name: "Stock IN", value: 3200, color: "#16A34A" },
        { name: "Stock OUT", value: 2100, color: "#F59E0B" },
        { name: "Aging Items", value: 1200, color: "#EF4444" },
    ];

    const agingData = [
        { range: "0-30", value: 12000 },
        { range: "30-60", value: 7000 },
        { range: "60-90", value: 3000 },
        { range: "90+", value: 800 },
    ];

    const movementData = [
        { month: "Jan", value: 6200 },
        { month: "Feb", value: 5900 },
        { month: "Mar", value: 6400 },
        { month: "Apr", value: 6800 },
        { month: "May", value: 7200 },
        { month: "Jun", value: 7600 },
        { month: "Jul", value: 8000 },
        { month: "Aug", value: 8300 },
        { month: "Sep", value: 8500 },
    ];

    /* ================= LOADING ================= */

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading Dashboard...
            </div>
        );
    }

    /* ================= ERROR ================= */

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-black text-white rounded-xl"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    /* ================= SAFE EXTRACTION ================= */

    const {
        totalStock = 0,
        lowStock = 0,
        damagedStock = 0,
        repairableStock = 0,
        categoryChart = [],
        movementData = [],
        stockList = [],
    } = data;

    /* ================= TABLE CONFIG ================= */

    const columns = [
        { header: "ID", accessorKey: "id" },
        { header: "Item Name", accessorKey: "name" },
        { header: "Category", accessorKey: "category" },
        { header: "Branch", accessorKey: "branchName" },
        { header: "Location", accessorKey: "location" },
        { header: "Quantity", accessorKey: "quantity" },
        { header: "Value", accessorKey: "value" },
    ];

    return (
        <div className="w-full bg-[#F7F9FB] min-h-screen">
            <div className="max-w-[1320px] mx-auto px-6 py-6 space-y-6">

                {/* ================= COUNT CARDS ================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StockCount
                        title="Total Stock Items"
                        value={Number(totalStock).toLocaleString()}
                        icon={Users}
                        iconBgColor="#E8F1FF"
                    />

                    <StockCount
                        title="Low Stock Items"
                        value={Number(lowStock).toLocaleString()}
                        icon={Package}
                        iconBgColor="#EEF5FF"
                    />

                    <StockCount
                        title="Damaged Stock"
                        value={Number(damagedStock).toLocaleString()}
                        icon={AlertTriangle}
                        iconBgColor="#FEE2E2"
                    />

                    <StockCount
                        title="Repairable Stock"
                        value={Number(repairableStock).toLocaleString()}
                        icon={TrendingUp}
                        iconBgColor="#DCFCE7"
                    />
                </div>

                {/* ================= CATEGORY BAR CHART ================= */}

                {Array.isArray(categoryChart) && categoryChart.length > 0 && (
                    <StockCategoryBarChart
                        title="Stock Analytics by Categories"
                        subtitle="Overview of stock distribution"
                        data={categoryChart}
                        bars={[
                            {
                                dataKey: "currentStock",
                                name: "Current Stock",
                            },
                        ]}
                    />
                )}

                {/* ================= MOVEMENT LINE CHART ================= */}

                {Array.isArray(movementData) && movementData.length > 0 && (
                    <StockLineChart
                        title="Stock Movement Trends"
                        subtitle="Stock IN vs Stock OUT"
                        data={movementData}
                        xKey="date"
                        yKey="stockIn"
                        secondYKey="stockOut"
                        lineColor="#2563EB"
                    />
                )}

                {/* ================= INVENTORY TABLE ================= */}

                {Array.isArray(stockList) && stockList.length > 0 && (
                    <StockInventoryTable
                        title="Complete Stock Inventory"
                        columns={columns}
                        data={stockList}
                        onAdd={() => console.log("Add clicked")}
                        onExport={() => console.log("Export clicked")}
                    />
                )}
            </div>
        </div>
    );
}