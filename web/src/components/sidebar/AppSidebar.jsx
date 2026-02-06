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
import { getIconByKey } from "./iconUtils";

import { BurgerMenu } from "./BurgerMenu";
import { SidebarClose } from "./SidebarClose";
import { SidebarToggle } from "./SidebarToggle";

// Import your icons (adjust based on your icon library)
import {
  Home,
  Package, // Products
  Box, // Inventory
  FolderTree, // Categories
  Calendar, // Events
  Settings, // Settings
  LogOut,
  LayoutDashboard, // Dashboard (if needed)
  BarChart3, // Reports (if needed)
  Users, // Users (if needed)
} from "lucide-react";

export function AppSidebar() {
  const { isCollapsed } = useSidebar();
  const { resources, loading } = useCrudResources();
  const location = useLocation();

  const shouldHideLabels = isCollapsed;

  return (
    <Sidebar>
      {/* Sidebar Header with close/toggle buttons */}
      <SidebarHeader>
        <div className="flex items-center justify-end gap-2 pt-3 px-3 pb-4">
          <SidebarClose />
          <SidebarToggle />
        </div>
      </SidebarHeader>

      {/* Scrollable Content */}
      <SidebarContent>
        {/* CRUD Pages Group */}
        <SidebarGroup>
          {!shouldHideLabels && <SidebarGroupLabel>Management</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/admin"
                  icon={LayoutDashboard}
                  isActive={location.pathname === "/admin"}
                >
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* API-driven items */}
              {!loading &&
                resources.map((item) => {
                  // Prefer item.icon; fall back to modelName (nice default if generator omitted icon)
                  // const Icon = item.icon ? iconRegistry[item.icon] : null; // enable when icons added
                  const key = (item.icon ?? item.modelName ?? "")
                    .toString()
                    .trim();
                  const Icon = getIconByKey(key, iconRegistry);
                  // if (!Icon) return null; // Skip items without a valid icon HIDDES WHOLE LINK, STUPID LINE

                  // Determine if this item is active based on current location
                  // Assumes item.path is like "products", "categories", etc.
                  // Adjust as needed based on your routing structure
                  const to = `/admin/${item.path}`;
                  const active = location.pathname.startsWith(to);

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton to={to} isActive={active} icon={Icon}>
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
          {!shouldHideLabels && (
            <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton to="#" icon={Settings}>
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton to="/logout" icon={LogOut}>
                  Logout
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
