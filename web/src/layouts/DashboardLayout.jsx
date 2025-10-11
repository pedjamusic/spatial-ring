import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/sidebar/SidebarProvider";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { SidebarTrigger } from "../components/sidebar/SidebarTrigger";

export function DashboardLayout() {
  return (
    <div className="flex gap-8 border-red-500 border-2">
      <SidebarProvider defaultOpen={true}>
        <div className="dashboard-layout border-green-500 border-2">
          <AppSidebar />
        </div>

        <main className="dashboard-main">
          <header className="dashboard-header">
            <SidebarTrigger />
            {/* User menu will go here on the right side */}
          </header>
          <div className="dashboard-content grow border-blue-500 border-2">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
