"use client";

import { Search, Phone } from "lucide-react";
import { useSuperDashboard } from "../../../context/SuperDashboardContext";
import { useMemo, useState } from "react";

/* ================= TYPES ================= */

type UserType = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile?: string;
  branch?: string;
  status?: "Active" | "Inactive";
  lastLogin?: string;
};

export default function UserManagementPage() {

  const { users } = useSuperDashboard();

  const tableUsers: UserType[] = Array.isArray(users)
    ? users
    : users?.users ?? [];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Users");
  const [statusFilter, setStatusFilter] = useState("All Status");

  /* ================= FILTER ================= */

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

  const roles = ["All Users", ...new Set(tableUsers.map((u) => u.role))];

  return (

    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-[28px] font-semibold text-[#0F172A] whitespace-nowrap">
          User Management
        </h1>

        <p className="text-[13px] text-[#64748B] mt-1 whitespace-nowrap">
          Manage companies, subscriptions, and licenses
        </p>
      </div>

      {/* FILTER BAR */}

      <div className="flex flex-col lg:flex-row gap-4">

        {/* SEARCH */}

        <div className="relative flex-1">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email or company"
            className="
              w-full
              h-[44px]
              pl-10 pr-4
              bg-white
              border border-[#E2E8F0]
              rounded-xl
              text-[14px]
              outline-none
              focus:ring-2 focus:ring-[#2563EB]/20
              whitespace-nowrap
            "
          />

        </div>

        {/* FILTERS */}

        <div className="flex gap-3">

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="
              h-[44px]
              px-4
              bg-white
              border border-[#E2E8F0]
              rounded-xl
              text-[14px]
              outline-none
              whitespace-nowrap
            "
          >
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              h-[44px]
              px-4
              bg-white
              border border-[#E2E8F0]
              rounded-xl
              text-[14px]
              outline-none
              whitespace-nowrap
            "
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

        </div>

      </div>

      {/* TABLE CARD */}

      <div
        className="
        bg-white
        rounded-2xl
        border border-[#EEF2F6]
        shadow-[0_6px_20px_rgba(0,0,0,0.04)]
        overflow-hidden
      "
      >

        {/* CARD HEADER */}

        <div className="px-6 py-4 border-b border-[#F1F5F9]">

          <h3 className="text-[16px] font-semibold text-[#0F172A] whitespace-nowrap">
            Aging Analysis
          </h3>

          <p className="text-[12px] text-[#64748B] mt-1 whitespace-nowrap">
            Remaining life of items
          </p>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr className="bg-[#F8FAFC] text-left">

                <TableHead>Age Range</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.map((user, i) => (

                <tr
                  key={user.id || i}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition"
                >

                  {/* USER */}

                  <td className="px-6 py-4 whitespace-nowrap">

                    <div className="flex items-center gap-3 whitespace-nowrap">

                      <img
                        src={`https://i.pravatar.cc/40?u=${user.email}`}
                        className="w-9 h-9 rounded-full"
                        alt=""
                      />

                      <div>

                        <p className="text-[14px] font-medium text-[#0F172A] whitespace-nowrap">
                          {user.name}
                        </p>

                        <p className="text-[12px] text-[#94A3B8] whitespace-nowrap">
                          {user.email}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* CONTACT */}

                  <td className="px-6 py-4 text-[14px] text-[#475569] whitespace-nowrap">

                    <div className="flex items-center gap-2 whitespace-nowrap">

                      <Phone className="w-4 h-4 text-[#94A3B8]" />

                      {user.phone || "98675 24589"}

                    </div>

                  </td>

                  {/* ROLE */}

                  <td className="px-6 py-4 text-[14px] text-[#475569] whitespace-nowrap">
                    {user.role}
                  </td>

                  {/* PROFILE */}

                  <td className="px-6 py-4 text-[14px] text-[#475569] whitespace-nowrap">
                    {user.profile || "Supervisor"}
                  </td>

                  {/* BRANCH */}

                  <td className="px-6 py-4 text-[14px] text-[#475569] whitespace-nowrap">
                    {user.branch || "Mumbai Branch"}
                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status || "Active"} />
                  </td>

                  {/* LOGIN */}

                  <td className="px-6 py-4 text-[13px] text-[#94A3B8] whitespace-nowrap">
                    {user.lastLogin || "2026-02-04 10:30pm"}
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

/* ================= TABLE HEAD ================= */

function TableHead({ children }: { children: React.ReactNode }) {

  return (
    <th className="px-6 py-4 text-[13px] font-medium text-[#475569] whitespace-nowrap">
      {children}
    </th>
  );

}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {

  if (status === "Inactive") {
    return (
      <span className="px-3 py-1 text-[12px] font-medium rounded-full bg-[#FEE2E2] text-[#DC2626] whitespace-nowrap">
        Inactive
      </span>
    );
  }

  return (
    <span className="px-3 py-1 text-[12px] font-medium rounded-full bg-[#DCFCE7] text-[#16A34A] whitespace-nowrap">
      Active
    </span>
  );

}