import { SuperDashboardProvider } from "@/app/context/SuperDashboardContext";
import Sidebar from "../../Component/Sidebar";
import Topbar from "../../Component/Topbar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperDashboardProvider>
      <div className="flex flex-col min-h-screen bg-[#F6F8FA] max-w-[1440px] ">

        <main className="flex-1  max-[1140px]:pl-0 overflow-y-auto">
          {children}
        </main>

      </div>
    </SuperDashboardProvider>
  );
}
