import { SuperDashboardProvider } from "@/app/context/SuperDashboardContext";
import Sidebar from "../../Component/Sidebar";
import Topbar from "../../Component/Topbar";
import DashboardLayout from "@/app/Component/DashboardLayout";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperDashboardProvider>
      <div className="flex flex-col min-h-screen bg-[#F6F8FA]  ">
        <DashboardLayout>

          <main className="flex-1 pt-[20px]  max-[1140px]:pl-0 overflow-y-auto">
            {children}
          </main>

        </DashboardLayout>



      </div>
    </SuperDashboardProvider>
  );
}
