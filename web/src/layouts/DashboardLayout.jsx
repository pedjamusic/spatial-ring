import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/sidebar/SidebarProvider";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { SidebarTrigger } from "../components/sidebar/SidebarTrigger";

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* <div className="dashboard-layout flex min-h-screen gap-8"> */}
      <div className="dashboard-layout flex sm:gap-2 md:gap-4 lg:gap-8">
        <AppSidebar />
        <main className="dashboard-main w-full py-4">
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
