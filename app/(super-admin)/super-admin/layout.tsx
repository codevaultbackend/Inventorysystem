import { SuperDashboardProvider } from "@/app/context/SuperDashboardContext";
import Sidebar from "./component/Sidebar";
import Topbar from "./component/Topbar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperDashboardProvider>
      <div className="flex flex-col min-h-screen bg-[#F6F8FA] max-w-[1440px] px-[16px] pt-[16px]">
        <Topbar />

        <div className="flex flex-1 max-[1140px]:flex-col">
          <Sidebar />

          <main className="flex-1 pl-[16px] pt-[16px] max-[1140px]:pl-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SuperDashboardProvider>
  );
}
