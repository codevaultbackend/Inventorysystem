"use client";

import {
  Search,
  Phone,
  Download,
  Mail,
  Building2,
  Shield,
  X,
} from "lucide-react";
import { useSuperDashboard } from "../../../context/SuperDashboardContext";
import { useEffect, useMemo, useRef, useState } from "react";

/* ================= TYPES ================= */

type UserType = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profile_image?: string;
  branch?: string;
  status?: "Active" | "Inactive";
  lastLogin?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "https://ims-backend-nm9g.onrender.com";

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


function FilterBarSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-[420px]">
        <div className="h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white" />
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-3">
        <div className="h-[44px] rounded-xl border border-[#E2E8F0] bg-white" />
        <div className="h-[44px] rounded-xl border border-[#E2E8F0] bg-white" />
        <div className="h-[44px] rounded-xl border border-[#E2E8F0] bg-white sm:col-span-2 xl:col-span-1" />
      </div>
    </div>
  );
}

function UsersTableSkeleton() {
  return (
    <>
      <div className="grid animate-pulse gap-4 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-[#E9EEF5]" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-32 rounded bg-[#E9EEF5]" />
                <div className="mt-2 h-3 w-40 rounded bg-[#E9EEF5]" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded bg-[#E9EEF5]" />
              <div className="h-4 w-[80%] rounded bg-[#E9EEF5]" />
              <div className="h-4 w-[70%] rounded bg-[#E9EEF5]" />
            </div>
          </div>
        ))}
      </div>

      <div
        className="
          hidden animate-pulse overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white
          shadow-[0_6px_20px_rgba(0,0,0,0.04)] md:block
        "
      >
        <div className="border-b border-[#F1F5F9] px-4 py-4 sm:px-6">
          <div className="h-5 w-36 rounded bg-[#E9EEF5]" />
          <div className="mt-2 h-4 w-72 max-w-full rounded bg-[#E9EEF5]" />
        </div>

        <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="h-4 w-20 rounded bg-[#E9EEF5]" />
            <div className="h-4 w-52 rounded bg-[#E9EEF5]" />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#F1F5F9]">
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[980px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#F8FAFC] text-left">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <th key={i} className="bg-[#F8FAFC] px-4 py-4 sm:px-6">
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
        </div>
      </div>
    </>
  );
}


export default function UserManagementPage() {
  const { users, loading, error } = useSuperDashboard();



  const tableUsers: UserType[] = Array.isArray(users) ? users : [];
  console.log(tableUsers)

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Users");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [previewUser, setPreviewUser] = useState<UserType | null>(null);

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

  /* ================= PREVIEW MODAL ESC CLOSE ================= */

  useEffect(() => {
    if (!previewUser) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewUser(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [previewUser]);

  /* ================= FILTER ================= */

  const filteredUsers = useMemo(() => {
    return tableUsers.filter((user) => {
      const searchValue = search.toLowerCase().trim();

      const name = (user.name ?? "").toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      const role = (user.role ?? "").toLowerCase();
      const branch = (user.branch ?? "").toLowerCase();
      const phone = (user.phone ?? "").toLowerCase();
      const profile = (user.profile ?? "").toLowerCase();

      const searchMatch =
        !searchValue ||
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        role.includes(searchValue) ||
        branch.includes(searchValue) ||
        phone.includes(searchValue) ||
        profile.includes(searchValue);

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
    <>
      <div className="w-full min-w-0 space-y-5 sm:space-y-6 ">
        <div className="min-w-0">
          <h1 className="break-words text-[22px] font-semibold leading-[1.2] text-[#0F172A] sm:text-[24px] xl:text-[28px]">
            User Management
          </h1>

          <p className="mt-1 text-[13px] text-[#64748B] sm:text-[14px]">
            Manage user accounts, roles, branch access, and activity
          </p>
        </div>

        {loading ? (
          <FilterBarSkeleton />
        ) : (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[420px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name, email, role or branch"
                className="
                  h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white
                  pl-10 pr-4 text-[14px] text-[#0F172A] outline-none transition
                  placeholder:text-[#94A3B8]
                  focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15
                "
              />
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="
                  h-[44px] min-w-0 rounded-xl border border-[#E2E8F0] bg-white
                  px-4 text-[14px] text-[#0F172A] outline-none transition
                  focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15
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
                  px-4 text-[14px] text-[#0F172A] outline-none transition
                  focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15
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
                  sm:col-span-2 xl:col-span-1
                "
              >
                <Download className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {downloadingCsv ? "Downloading..." : "Download CSV"}
                </span>
              </button>
            </div>
          </div>
        )}

        {(error || downloadError) && !loading && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
            {downloadError || error}
          </div>
        )}

        {loading ? (
          <UsersTableSkeleton />
        ) : (
          <>
            {/* MOBILE */}
            <div className="grid gap-4 md:hidden ">
              <div
                className="
                  overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white
                  shadow-[0_6px_20px_rgba(0,0,0,0.04)] 
                "
              >
                <div className="border-b border-[#F1F5F9] px-4 py-4">
                  <h3 className="text-[16px] font-semibold text-[#0F172A]">
                    Users Directory
                  </h3>
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    Browse all users, contact details, roles, status, and recent
                    login activity
                  </p>
                </div>

                <div className="px-4 py-3">
                  <p className="text-[12px] text-[#94A3B8]">
                    {filteredUsers.length} user
                    {filteredUsers.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <UserMobileCard
                    key={user.id || i}
                    user={user}
                    onPreviewImage={() => setPreviewUser(user)}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#DCE4EC] bg-[#FAFBFC] px-4 py-10 text-center">
                  <p className="text-[15px] font-medium text-[#0F172A]">
                    No users found
                  </p>
                  <p className="mt-1 text-[13px] text-[#64748B]">
                    Try changing the search text or filter options
                  </p>
                </div>
              )}
            </div>

            {/* DESKTOP */}
            <div
              className="
                hidden overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white
                shadow-[0_6px_20px_rgba(0,0,0,0.04)] md:block
              "
            >
              <div className="border-b border-[#F1F5F9] px-4 py-4 sm:px-6">
                <h3 className="text-[16px] font-semibold text-[#0F172A]">
                  Users Directory
                </h3>

                <p className="mt-1 text-[12px] text-[#64748B] sm:text-[13px]">
                  Browse all users, contact details, roles, status, and recent
                  login activity
                </p>
              </div>

              <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] text-[#94A3B8] sm:text-[13px]">
                    {filteredUsers.length} user
                    {filteredUsers.length !== 1 ? "s" : ""} found
                  </p>

                  <p className="text-[12px] text-[#94A3B8] sm:text-right">
                    Drag horizontally to view more columns
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#F1F5F9]">
                  <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                    className={`max-h-[560px] overflow-auto ${
                      isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                    }`}
                  >
                    <table className="w-full min-w-[980px]">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-[#F8FAFC] text-left">
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Role</TableHead>
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
                              <td className="px-4 py-4 align-middle sm:px-6">
                                <div className="flex min-w-[240px] items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewUser(user)}
                                    className="group relative shrink-0 rounded-full outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                                    aria-label={`Preview ${user.name || "user"} profile image`}
                                  >
                                    <img
                                      src={user.profile_image}
                                      className="h-10 w-10 rounded-full object-cover transition duration-200 group-hover:scale-[1.04]"
                                      alt={user.name || "User"}
                                      draggable={false}
                                    />
                                    <span className="pointer-events-none absolute inset-0 rounded-full ring-0 transition group-hover:ring-2 group-hover:ring-[#2563EB]/20" />
                                  </button>

                                  <div className="min-w-0">
                                    <p className="truncate text-[14px] font-medium text-[#0F172A]">
                                      {user.name || "Unknown User"}
                                    </p>

                                    {user.email ? (
                                      <a
                                        href={`mailto:${user.email}`}
                                        className="truncate text-[12px] !text-[#0F172A] transition hover:text-[#0F172A] hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {user.email}
                                      </a>
                                    ) : (
                                      <p className="truncate text-[12px] text-[#94A3B8]">
                                        No email
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 align-middle text-[14px] text-[#475569] sm:px-6">
                                <div className="flex min-w-[160px] items-center gap-2">
                                  <Phone className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                                  {user.phone ? (
                                    <a
                                      href={`tel:${user.phone}`}
                                      className="truncate !text-[#0F172A] transition hover:!text-[#0F172A] hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {user.phone}
                                    </a>
                                  ) : (
                                    <span className="truncate text-[#475569]">
                                      Not available
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4 align-middle text-[14px] text-[#475569] capitalize sm:px-6">
                                <div className="min-w-[150px]">
                                  {(user.role || "N/A").replaceAll("_", " ")}
                                </div>
                              </td>

                             

                              <td className="px-4 py-4 align-middle text-[14px] text-[#475569] sm:px-6">
                                <div className="min-w-[160px]">
                                  {user.branch || "No branch assigned"}
                                </div>
                              </td>

                              <td className="px-4 py-4 align-middle sm:px-6">
                                <div className="min-w-[100px]">
                                  <StatusBadge status={user.status || "Active"} />
                                </div>
                              </td>

                              <td className="px-4 py-4 align-middle text-[13px] text-[#94A3B8] sm:px-6">
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

                <p className="mt-3 text-[12px] text-[#94A3B8]">
                  On smaller laptops, drag left/right or use trackpad shift scroll
                  to view all columns
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <ImagePreviewModal
        user={previewUser}
        onClose={() => setPreviewUser(null)}
      />
    </>
  );
}

/* ================= MOBILE CARD ================= */

function UserMobileCard({
  user,
  onPreviewImage,
}: {
  user: UserType;
  onPreviewImage: () => void;
}) {
  return (
    <div
      className="
        overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white
        p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] !min-h-[441px]
      "
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onPreviewImage}
          className="group relative shrink-0 rounded-full outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          aria-label={`Preview ${user.name || "user"} profile image`}
        >
          <img
            src={user.profile_image}
            className="h-11 w-11 rounded-full object-cover transition duration-200 group-hover:scale-[1.04]"
            alt={user.name || "User"}
            draggable={false}
          />
          <span className="pointer-events-none absolute inset-0 rounded-full ring-0 transition group-hover:ring-2 group-hover:ring-[#2563EB]/20" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#0F172A]">
                {user.name || "Unknown User"}
              </p>

              {user.email ? (
                <a
                  href={`mailto:${user.email}`}
                  className="mt-1 block truncate text-[12px] text-[#0F172A] transition  hover:underline"
                >
                  {user.email}
                </a>
              ) : (
                <p className="mt-1 truncate text-[12px] text-[#94A3B8]">
                  No email
                </p>
              )}
            </div>

            <StatusBadge status={user.status || "Active"} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <MobileInfoRow
          icon={<Phone className="h-4 w-4 text-[#94A3B8]" />}
          label="Phone"
          value={
            user.phone ? (
              <a
                href={`tel:${user.phone}`}
                className="!text-[#0F172A] transition hover:text-[#0F172A] hover:underline"
              >
                {user.phone}
              </a>
            ) : (
              "Not available"
            )
          }
        />

        <MobileInfoRow
          icon={<Shield className="h-4 w-4 text-[#94A3B8]" />}
          label="Role"
          value={(user.role || "N/A").replaceAll("_", " ")}
        />

        <MobileInfoRow
          icon={<Mail className="h-4 w-4 text-[#94A3B8]" />}
          label="Profile"
          value={user.profile || "Team Member"}
        />

        <MobileInfoRow
          icon={<Building2 className="h-4 w-4 text-[#94A3B8]" />}
          label="Branch"
          value={user.branch || "No branch assigned"}
        />

        <div className="rounded-xl bg-[#F8FAFC] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">
            Last Login
          </p>
          <p className="mt-1 text-[13px] text-[#475569]">
            {user.lastLogin || "No recent login"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#F8FAFC] px-3 py-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">
          {label}
        </p>
        <div className="mt-0.5 break-words text-[13px] text-[#475569]">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ================= IMAGE PREVIEW MODAL ================= */

function ImagePreviewModal({
  user,
  onClose,
}: {
  user: UserType | null;
  onClose: () => void;
}) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center
            rounded-full bg-white/90 text-[#0F172A] shadow-md transition hover:bg-white
          "
          aria-label="Close image preview"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="bg-[#F8FAFC] px-5 py-4">
            <p className="truncate text-[16px] font-semibold text-[#0F172A]">
              {user.name || "User"}
            </p>
            <p className="mt-1 truncate text-[13px] text-[#64748B]">
              {user.email || "No email available"}
            </p>
          </div>

          <div className="flex items-center justify-center bg-[#E2E8F0] p-4 sm:p-6">
            <img
              src={user.profile_image}
              alt={user.name || "User"}
              className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain"
              draggable={false}
            />
          </div>
        </div>
      </div>
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