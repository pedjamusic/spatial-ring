import { useLocation } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarContent } from "./SidebarContent";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarGroupLabel } from "./SidebarGroupLabel";
import { SidebarGroupContent } from "./SidebarGroupContent";
import { SidebarMenu } from "./SidebarMenu";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SidebarMenuButton } from "./SidebarMenuButton";
import { SidebarSeparator } from "./SidebarSeparator";
import { useSidebar } from "./useSidebar";
import { useCrudResources } from "./useCrudResources";
import { iconRegistry } from "./iconRegistry";

// Import your icons (adjust based on your icon library)
import {
  Home,
  Package, // Products
  Box, // Inventory
  FolderTree, // Categories
  Calendar, // Events
  Settings, // Settings
  LayoutDashboard, // Dashboard (if needed)
  BarChart3, // Reports (if needed)
  Users, // Users (if needed)
} from "lucide-react";

export function AppSidebar() {
  const { open } = useSidebar();
  const { resources, loading } = useCrudResources();
  const location = useLocation();

  const isDashboardActive = location.pathname === "/admin";

  return (
    <Sidebar>
      {/* Logo Header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 p-4">
          <img
            src="/src/assets/Logo transparent.png"
            alt="Spatial Ring App"
            className={`transition-all ${open ? "h-8 w-8" : "h-6 w-6"}`}
          />
          {open && <span className="font-semibold text-lg">Spatial Ring</span>}
        </div>
      </SidebarHeader>

      {/* Scrollable Content */}
      <SidebarContent>
        {/* CRUD Pages Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/admin"
                  // icon={Home}
                  isActive={isDashboardActive}
                  // isActive={location.pathname === "/admin"}
                >
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* API-driven items */}
              {!loading &&
                resources.map((item) => {
                  const Icon = iconRegistry[item.icon]; // enable when icons added
                  const to = `/admin/${item.path}`;
                  const active = location.pathname.startsWith(to);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton to={to} isActive={active}>
                        {Icon && (
                          <Icon className="sidebar-icon" aria-hidden="true" />
                        )}
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings Group (Placeholder for future) */}
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton to="#" icon={Settings}>
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
