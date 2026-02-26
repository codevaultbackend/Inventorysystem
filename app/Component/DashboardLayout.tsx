"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/app/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col">
        <Topbar role={role} />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}