import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/sidebar/SidebarProvider";
import { AppSidebar } from "../components/sidebar/AppSidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="dashboard-layout flex gap-2 lg:gap-4">
        <AppSidebar />
        <main className="dashboard-main w-full flex-11 py-4 lg:flex-10">
          <div className="dashboard-content px-4 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
