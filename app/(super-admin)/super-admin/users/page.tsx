"use client";

import { Search, Phone } from "lucide-react";
import { useSuperDashboard } from "../../../context/SuperDashboardContext";
import { useMemo, useState } from "react";

/* ================= TYPES ================= */

type UserType = {
  id: number;
  name: string;
  email: string;
  role: string;
  branch: string | null;
};

export default function UserManagementPage() {
  const { users } = useSuperDashboard();

  // SAFE DATA (handles object or array)
  const tableUsers: UserType[] = Array.isArray(users)
    ? users
    : users?.users ?? [];

  /* ================= STATE ================= */

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Users");
  const [statusFilter, setStatusFilter] = useState("All Status");

  /* ================= FILTER LOGIC ================= */

  const filteredUsers = useMemo(() => {
    return tableUsers.filter((user) => {
      const searchMatch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase()) ||
        (user.branch ?? "").toLowerCase().includes(search.toLowerCase());

      const roleMatch =
        roleFilter === "All Users" || user.role === roleFilter;

      const statusMatch =
        statusFilter === "All Status" || statusFilter === "Active";

      return searchMatch && roleMatch && statusMatch;
    });
  }, [tableUsers, search, roleFilter, statusFilter]);

  /* ================= UNIQUE ROLES ================= */

  const roles = ["All Users", ...new Set(tableUsers.map((u) => u.role))];

  return (
    <div className="space-y-6">

      {/* ================= TITLE ================= */}
      <div>
        <h1 className="text-[28px] font-semibold text-[#0F172A]">
          User Management
        </h1>
        <p className="text-[13px] text-[#64748B] mt-1">
          Manage companies, subscriptions, and licenses
        </p>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-col xl:flex-row gap-4">

        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email or company"
            className="
              w-full pl-10 pr-4 h-[42px]
              bg-white rounded-xl border border-[#E2E8F0]
              text-[14px] outline-none
              focus:ring-2 focus:ring-[#2563EB]/20
            "
          />
        </div>

        {/* ROLE FILTER */}
        <div className="flex gap-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 h-[42px] bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#334155]"
          >
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 h-[42px] bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#334155]"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-[0_6px_20px_rgba(0,0,0,0.04)]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F1F5F9]">
          <h3 className="text-[16px] font-semibold text-[#0F172A]">
            Aging Analysis
          </h3>
          <p className="text-[12px] text-[#64748B] mt-1">
            Remaining life of items
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#F8FAFC] text-left">
                {[
                  "Age Range",
                  "Contact",
                  "Role",
                  "Branch",
                  "Status",
                  "Last Login",
                  "Action",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-[#475569]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, i) => (
                <tr
                  key={user.id || i}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition"
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://i.pravatar.cc/40?u=${user.email}`}
                        alt=""
                        className="w-9 h-9 rounded-full"
                      />
                      <div>
                        <p className="text-[14px] font-medium text-[#0F172A]">
                          {user.name}
                        </p>
                        <p className="text-[12px] text-[#94A3B8]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 text-[14px] text-[#475569]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#94A3B8]" />
                      -
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 text-[14px] text-[#475569]">
                    {user.role}
                  </td>

                  {/* Branch */}
                  <td className="px-6 py-4 text-[14px] text-[#475569]">
                    {user.branch ?? "-"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status="Active" />
                  </td>

                  {/* Last Login */}
                  <td className="px-6 py-4 text-[14px] text-[#94A3B8]">
                    -
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <button className="text-[#2563EB] text-[14px] font-medium hover:underline whitespace-nowrap">
                      More Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {
  if (status === "Inactive") {
    return (
      <span className="px-3 py-1 text-[12px] font-medium rounded-full bg-[#FEE2E2] text-[#DC2626]">
        Inactive
      </span>
    );
  }

  return (
    <span className="px-3 py-1 text-[12px] font-medium rounded-full bg-[#DCFCE7] text-[#16A34A]">
      Active
    </span>
  );
}
