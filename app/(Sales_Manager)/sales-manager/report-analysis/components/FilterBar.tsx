"use client";

import { useState } from "react";
import { Calendar, Filter } from "lucide-react";

export default function ReportFilterBar({ onFilterChange }) {
  const [date, setDate] = useState("");
  const [type, setType] = useState("");

  const handleChange = (newDate, newType) => {
    const filters = {
      date: newDate ?? date,
      type: newType ?? type,
    };

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">

        {/* Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} />
            <span className="text-sm font-medium">Date Range</span>
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              handleChange(e.target.value, null);
            }}
            className="h-[38px] w-full sm:w-[180px] rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Report Type */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={18} />
            <span className="text-sm font-medium">Report Type</span>
          </div>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              handleChange(null, e.target.value);
            }}
            className="h-[38px] w-full sm:w-[180px] rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="clients">Clients</option>
          </select>
        </div>

      </div>
    </div>
  );
}