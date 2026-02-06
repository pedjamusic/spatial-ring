import { Button } from "react-aria-components";
import { X } from "lucide-react";
import { useSidebar } from "./useSidebar";

export function SidebarClose({ className = "" }) {
  const { isMobile, closeMobileDrawer } = useSidebar();

  // Only show on mobile/tablet (< 1024px) overlay
  if (!isMobile) {
    return null;
  }

  return (
    <Button
      onPress={closeMobileDrawer}
      className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label="Close navigation"
    >
      <X className="h-5 w-5" />
    </Button>
  );
}
