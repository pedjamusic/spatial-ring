import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/sidebar/SidebarProvider";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { SidebarTrigger } from "../components/sidebar/SidebarTrigger";

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* <div className="dashboard-layout flex min-h-screen gap-8"> */}
      <div className="dashboard-layout flex gap-2 lg:gap-4">
        <AppSidebar />
        <main className="dashboard-main w-full flex-11 py-4 lg:flex-10">
          <header className="dashboard-header">
            {/* <SidebarTrigger /> */}
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
