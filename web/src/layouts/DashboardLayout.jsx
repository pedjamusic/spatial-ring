import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/sidebar/SidebarProvider";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { SidebarTrigger } from "../components/sidebar/SidebarTrigger";

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="dashboard-layout">
        <AppSidebar />

        <main className="dashboard-main">
          <header className="dashboard-header">
            <SidebarTrigger />
            {/* User menu will go here on the right side */}
          </header>

          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
