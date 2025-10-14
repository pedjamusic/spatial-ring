import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/sidebar/SidebarProvider";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { SidebarTrigger } from "../components/sidebar/SidebarTrigger";

export function DashboardLayout() {
  return (
    <div className="flex gap-8 ">
      <SidebarProvider defaultOpen={true}>
        <div className="dashboard-layout">
          <AppSidebar />
        </div>

        <main className="dashboard-main bg-white w-full rounded-xl border-gray-200 border-1">
          <header className="dashboard-header">
            <SidebarTrigger />
            {/* User menu will go here on the right side */}
          </header>
          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
