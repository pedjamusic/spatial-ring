import { Button } from "react-aria-components";
import { Menu } from "lucide-react";
import { useSidebar } from "./useSidebar";

export function BurgerMenu({ className = "" }) {
  const { toggleSidebar, isOverlayOpen, isCollapsed, isMobile } = useSidebar();

  const label = isMobile
    ? isOverlayOpen
      ? "Close navigation menu"
      : "Open navigation menu"
    : isCollapsed
      ? "Expand sidebar"
      : "Collapse sidebar";

  return (
    <Button
      onPress={toggleSidebar}
      className={`flex h-8 w-8 items-center justify-center rounded-md hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={label}
    >
      <Menu size={20} />
    </Button>
  );
}
