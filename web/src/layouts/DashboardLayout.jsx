import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/sidebar/SidebarProvider";
import { AppSidebar } from "../components/sidebar/AppSidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="dashboard-layout flex">
        <AppSidebar />
        <main className="dashboard-main w-full min-w-0 flex-1 py-4">
          <div className="dashboard-content px-4 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
