"use client";

import { Search, Plus, Pencil, Check, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

export default function DashboardTable({ data = [] }: any) {
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState<any[]>([]);
    const [adding, setAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    /* ================= SYNC ================= */
    useEffect(() => {
        setRows(data);
    }, [data]);

    /* ================= NEW ROW ================= */
    const emptyRow = {
        itemName: "",
        category: "",
        hsn: "",
        grn: "",
        po: "",
        stock: "",
        stockIn: "",
        stockOut: "",
        scrap: "",
        dispatch: "",
        delivery: "",
        status: "Good",
    };

    const [newRow, setNewRow] = useState(emptyRow);
    const [editRow, setEditRow] = useState<any>({});

    /* ================= FILTER ================= */
    const filteredData = useMemo(() => {
        if (!search) return rows;

        return rows.filter((row: any) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [rows, search]);

    /* ================= ADD ================= */
    const handleAdd = () => setAdding(true);

    const handleSave = () => {
        setRows([newRow, ...rows]);
        setNewRow(emptyRow);
        setAdding(false);
    };

    /* ================= EDIT ================= */
    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditRow(rows[index]);
    };

    const handleUpdate = () => {
        const updated = [...rows];
        updated[editingIndex!] = editRow;
        setRows(updated);
        setEditingIndex(null);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    const handleChange = (key: string, value: any) => {
        if (editingIndex !== null) {
            setEditRow((prev: any) => ({ ...prev, [key]: value }));
        } else {
            setNewRow((prev) => ({ ...prev, [key]: value }));
        }
    };

    /* ================= STATUS STYLE ================= */
    const getStatusStyle = (status: string) => {
        if (status === "Good") return "bg-green-100 text-green-600";
        if (status === "Damaged") return "bg-red-100 text-red-600";
        if (status === "Repairable") return "bg-yellow-100 text-yellow-600";
        return "";
    };

    const columns = [
        "itemName",
        "category",
        "hsn",
        "grn",
        "po",
        "stock",
        "stockIn",
        "stockOut",
        "scrap",
        "dispatch",
        "delivery",
        "status",
    ];

    return (
        <div className="rounded-[22px] border border-[#E5E7EB] bg-white shadow-sm">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-[#F1F5F9]">

                <h3 className="text-[15px] font-semibold text-[#111827]">
                    Inventory Table
                </h3>

                <div className="flex gap-2">
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-1 px-4 h-[36px] rounded-[10px] bg-[#2563EB] text-white text-[13px]"
                    >
                        <Plus size={16} /> Add Item
                    </button>

                    <button className="px-4 h-[36px] rounded-[10px] border text-[13px]">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* SEARCH */}
            <div className="px-6 py-4">
                <div className="relative w-[280px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by item..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-[36px] pl-9 pr-3 rounded-[10px] border bg-gray-50 text-[13px]"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left min-w-[1000px]">

                    {/* HEADER */}
                    <thead className="bg-[#F9FAFB] text-[12px] text-[#6B7280]">
                        <tr>
                            {[
                                "Item Name",
                                "Categories",
                                "HSN",
                                "GRN",
                                "PO",
                                "Stock",
                                "IN",
                                "OUT",
                                "Scrap",
                                "Dispatch",
                                "Delivery",
                                "Status",
                                "Action",
                            ].map((h) => (
                                <th key={h} className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>

                        {/* ADD ROW */}
                        {adding && (
                            <tr className="border-t bg-[#F8FAFC]">

                                {columns.map((key) => (
                                    <td key={key} className="px-5 py-3">

                                        {key === "status" ? (
                                            <select
                                                value={newRow.status}
                                                onChange={(e) => handleChange(key, e.target.value)}
                                                className="h-[34px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#374151] outline-none focus:ring-2 focus:ring-blue-100"
                                            >
                                                <option>Good</option>
                                                <option>Damaged</option>
                                                <option>Repairable</option>
                                            </select>
                                        ) : (
                                            <input
                                                value={newRow[key] || ""}
                                                onChange={(e) => handleChange(key, e.target.value)}
                                                placeholder="Enter..."
                                                className="h-[34px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        )}

                                    </td>
                                ))}

                                {/* ACTION BUTTONS */}
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2 justify-center">

                                        <button
                                            onClick={handleSave}
                                            className="flex items-center justify-center h-[32px] w-[32px] rounded-[8px] bg-green-50 hover:bg-green-100 transition"
                                        >
                                            <Check size={16} className="text-green-600" />
                                        </button>

                                        <button
                                            onClick={() => setAdding(false)}
                                            className="flex items-center justify-center h-[32px] w-[32px] rounded-[8px] bg-gray-100 hover:bg-gray-200 transition"
                                        >
                                            <X size={16} className="text-gray-600" />
                                        </button>

                                    </div>
                                </td>

                            </tr>
                        )}

                        {/* DATA */}
                        {filteredData.map((row: any, index: number) => {
                            const isEditing = editingIndex === index;

                            return (
                                <tr key={index} className="border-t hover:bg-[#F9FAFB] text-[13px]">

                                    {columns.map((key) => (
                                        <td key={key} className="px-4 py-3">

                                            {isEditing ? (
                                                key === "status" ? (
                                                    <select
                                                        value={editRow[key]}
                                                        onChange={(e) => handleChange(key, e.target.value)}
                                                        className="border rounded px-2 py-1 text-xs"
                                                    >
                                                        <option>Good</option>
                                                        <option>Damaged</option>
                                                        <option>Repairable</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        value={editRow[key]}
                                                        onChange={(e) => handleChange(key, e.target.value)}
                                                        className="border rounded px-2 py-1 text-xs w-full"
                                                    />
                                                )
                                            ) : key === "status" ? (
                                                <span className={`px-2 py-1 rounded-full text-[11px] ${getStatusStyle(row.status)}`}>
                                                    {row.status}
                                                </span>
                                            ) : (
                                                row[key]
                                            )}

                                        </td>
                                    ))}

                                    {/* ACTION */}
                                    <td className="px-4 py-3 flex gap-2">

                                        {isEditing ? (
                                            <>
                                                <button onClick={handleUpdate}>
                                                    <Check size={16} className="text-green-600" />
                                                </button>
                                                <button onClick={handleCancelEdit}>
                                                    <X size={16} className="text-gray-500" />
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEdit(index)}>
                                                <Pencil size={16} className="text-blue-600" />
                                            </button>
                                        )}

                                    </td>

                                </tr>
                            );
                        })}

                    </tbody>
                </table>
            </div>
        </div>
    );
}