"use client";

import { Search, Phone, Download } from "lucide-react";
import { useSuperDashboard } from "../../../context/SuperDashboardContext";
import { useMemo, useRef, useState } from "react";

/* ================= TYPES ================= */

type UserType = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profile?: string;
  branch?: string;
  status?: "Active" | "Inactive";
  lastLogin?: string;
};

function FilterBarSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-[420px]">
        <div className="h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white" />
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
        <div className="h-[44px] min-w-0 rounded-xl border border-[#E2E8F0] bg-white" />
        <div className="h-[44px] min-w-0 rounded-xl border border-[#E2E8F0] bg-white" />
      </div>
    </div>
  );
}

function UsersTableSkeleton() {
  return (
    <div
      className="
        overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white
        shadow-[0_6px_20px_rgba(0,0,0,0.04)] animate-pulse
      "
    >
      <div className="border-b border-[#F1F5F9] px-4 py-4 sm:px-6">
        <div className="h-5 w-36 rounded bg-[#E9EEF5]" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-[#E9EEF5]" />
      </div>

      <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="h-4 w-20 rounded bg-[#E9EEF5]" />
          <div className="hidden h-4 w-52 rounded bg-[#E9EEF5] sm:block" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#F1F5F9]">
          <div className="max-h-[560px] overflow-y-auto overflow-x-hidden">
            <table className="w-full min-w-[980px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F8FAFC] text-left">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <th
                      key={i}
                      className="bg-[#F8FAFC] px-4 py-4 sm:px-6"
                    >
                      <div className="h-4 w-20 rounded bg-[#E9EEF5]" />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-[#F1F5F9]">
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#E9EEF5]" />
                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-28 rounded bg-[#E9EEF5]" />
                          <div className="mt-2 h-3 w-36 rounded bg-[#E9EEF5]" />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <div className="min-w-[150px]">
                        <div className="h-4 w-24 rounded bg-[#E9EEF5]" />
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <div className="min-w-[140px]">
                        <div className="h-4 w-20 rounded bg-[#E9EEF5]" />
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <div className="min-w-[120px]">
                        <div className="h-4 w-24 rounded bg-[#E9EEF5]" />
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <div className="min-w-[140px]">
                        <div className="h-4 w-24 rounded bg-[#E9EEF5]" />
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <div className="min-w-[100px]">
                        <div className="h-7 w-20 rounded-full bg-[#E9EEF5]" />
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <div className="min-w-[150px]">
                        <div className="h-4 w-24 rounded bg-[#E9EEF5]" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 h-4 w-48 rounded bg-[#E9EEF5] sm:hidden" />
      </div>
    </div>
  );
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://ims-swp9.onrender.com";

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt")
  );
};

export default function UserManagementPage() {
  const { users, loading, error } = useSuperDashboard();

  const tableUsers: UserType[] = Array.isArray(users) ? users : [];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Users");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  /* ================= DRAG SCROLL ================= */

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    startX: 0,
    scrollLeft: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || loading) return;

    setIsDragging(true);
    dragState.current = {
      startX: e.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current || loading) return;

    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - dragState.current.startX;
    scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  /* ================= FILTER ================= */

  const filteredUsers = useMemo(() => {
    return tableUsers.filter((user) => {
      const searchValue = search.toLowerCase().trim();

      const name = (user.name ?? "").toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      const role = (user.role ?? "").toLowerCase();
      const branch = (user.branch ?? "").toLowerCase();
      const phone = (user.phone ?? "").toLowerCase();

      const searchMatch =
        !searchValue ||
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        role.includes(searchValue) ||
        branch.includes(searchValue) ||
        phone.includes(searchValue);

      const normalizedRole = user.role ?? "";
      const roleMatch =
        roleFilter === "All Users" || normalizedRole === roleFilter;

      const userStatus = user.status || "Active";
      const statusMatch =
        statusFilter === "All Status" || userStatus === statusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  }, [tableUsers, search, roleFilter, statusFilter]);

  const roles = useMemo(() => {
    return [
      "All Users",
      ...Array.from(new Set(tableUsers.map((u) => u.role).filter(Boolean))),
    ] as string[];
  }, [tableUsers]);

  const handleDownloadUsersCsv = async () => {
    try {
      setDownloadingCsv(true);
      setDownloadError("");

      const token = getStoredToken();

      const response = await fetch(`${API_BASE}/getcsv/user-get/export-excel`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        let message = "Failed to download CSV";
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          //
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const contentDisposition =
        response.headers.get("content-disposition") || "";
      const match = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fileName = match?.[1] || `users-report-${Date.now()}.csv`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setDownloadError(err?.message || "Unable to download users CSV");
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* PAGE HEADER */}

      <div className="min-w-0">
        <h1 className="break-words text-[24px] font-semibold text-[#0F172A] sm:text-[28px]">
          User Management
        </h1>

        <p className="mt-1 text-[13px] text-[#64748B] sm:text-[14px]">
          Manage user accounts, roles, branch access, and activity
        </p>
      </div>

      {/* FILTER BAR */}

      {loading ? (
        <FilterBarSkeleton />
      ) : (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[420px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, role or branch"
              className="
                h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white
                pl-10 pr-4 text-[14px] outline-none
                focus:ring-2 focus:ring-[#2563EB]/20
              "
            />
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="
                h-[44px] min-w-0 rounded-xl border border-[#E2E8F0] bg-white
                px-4 text-[14px] outline-none
              "
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                h-[44px] min-w-0 rounded-xl border border-[#E2E8F0] bg-white
                px-4 text-[14px] outline-none
              "
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              type="button"
              onClick={handleDownloadUsersCsv}
              disabled={downloadingCsv}
              className="
                inline-flex h-[44px] min-w-0 items-center justify-center gap-2
                rounded-xl border border-[#E2E8F0] bg-white px-4 text-[14px]
                font-medium text-[#0F172A] outline-none transition
                hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              <Download className="h-4 w-4" />
              {downloadingCsv ? "Downloading..." : "Download CSV"}
            </button>
          </div>
        </div>
      )}

      {/* TABLE CARD */}

      {loading ? (
        <UsersTableSkeleton />
      ) : (
        <div
          className="
            overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white
            shadow-[0_6px_20px_rgba(0,0,0,0.04)]
          "
        >
          <div className="border-b border-[#F1F5F9] px-4 py-4 sm:px-6">
            <h3 className="text-[16px] font-semibold text-[#0F172A]">
              Users Directory
            </h3>

            <p className="mt-1 text-[12px] text-[#64748B] sm:text-[13px]">
              Browse all users, contact details, roles, status, and recent login
              activity
            </p>
          </div>

          <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[12px] text-[#94A3B8] sm:text-[13px]">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
              </p>

              <p className="hidden text-[12px] text-[#94A3B8] sm:block">
                Drag horizontally to view more columns
              </p>
            </div>

            {(error || downloadError) && (
              <div className="mb-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
                {downloadError || error}
              </div>
            )}

            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              className={`overflow-x-auto rounded-xl border border-[#F1F5F9] ${
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              }`}
            >
              <div className="max-h-[560px] overflow-y-auto overflow-x-hidden">
                <table className="w-full min-w-[980px]">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-[#F8FAFC] text-left">
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, i) => (
                        <tr
                          key={user.id || i}
                          className="border-b border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
                        >
                          <td className="px-4 py-4 sm:px-6">
                            <div className="flex min-w-[220px] items-center gap-3">
                              <img
                                src={`https://i.pravatar.cc/40?u=${encodeURIComponent(
                                  user.email || user.name || String(user.id)
                                )}`}
                                className="h-9 w-9 rounded-full object-cover"
                                alt={user.name || "User"}
                                draggable={false}
                              />

                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-medium text-[#0F172A]">
                                  {user.name || "Unknown User"}
                                </p>

                                <p className="truncate text-[12px] text-[#94A3B8]">
                                  {user.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-[14px] text-[#475569] sm:px-6">
                            <div className="flex min-w-[150px] items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                              <span>{user.phone || "Not available"}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-[14px] text-[#475569] capitalize sm:px-6">
                            <div className="min-w-[140px]">
                              {(user.role || "N/A").replaceAll("_", " ")}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-[14px] text-[#475569] sm:px-6">
                            <div className="min-w-[120px]">
                              {user.profile || "Team Member"}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-[14px] text-[#475569] sm:px-6">
                            <div className="min-w-[140px]">
                              {user.branch || "No branch assigned"}
                            </div>
                          </td>

                          <td className="px-4 py-4 sm:px-6">
                            <div className="min-w-[100px]">
                              <StatusBadge status={user.status || "Active"} />
                            </div>
                          </td>

                          <td className="px-4 py-4 text-[13px] text-[#94A3B8] sm:px-6">
                            <div className="min-w-[150px]">
                              {user.lastLogin || "No recent login"}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 sm:px-6">
                          <div className="rounded-xl border border-dashed border-[#DCE4EC] bg-[#FAFBFC] px-4 py-10 text-center">
                            <p className="text-[15px] font-medium text-[#0F172A]">
                              No users found
                            </p>
                            <p className="mt-1 text-[13px] text-[#64748B]">
                              Try changing the search text or filter options
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-[12px] text-[#94A3B8] sm:hidden">
              Swipe or drag left/right to view hidden columns
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= TABLE HEAD ================= */

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="sticky top-0 z-20 bg-[#F8FAFC] px-4 py-4 text-[13px] font-medium text-[#475569] sm:px-6">
      <span className="whitespace-nowrap">{children}</span>
    </th>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {
  if (status === "Inactive") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-[#FEE2E2] px-3 py-1 text-[12px] font-medium text-[#DC2626]">
        Inactive
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-[#DCFCE7] px-3 py-1 text-[12px] font-medium text-[#16A34A]">
      Active
    </span>
  );
}