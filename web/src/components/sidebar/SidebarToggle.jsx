import { Button } from "react-aria-components";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./useSidebar";

export function SidebarToggle({ className = "" }) {
  const { isMobile, isCollapsed, toggleCollapsed } = useSidebar();

  // Only show on desktop (≥ 1024px)
  if (isMobile) {
    return null;
  }

  return (
    <Button
      onPress={toggleCollapsed}
      className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <PanelLeftOpen className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
    </Button>
  );
}
