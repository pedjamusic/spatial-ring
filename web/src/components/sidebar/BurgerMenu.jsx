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
      className={`ml-0.5 flex h-10 w-10 items-center justify-center rounded-xl hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700/50 ${className}`}
      aria-label={label}
    >
      <Menu size={24} strokeWidth={4} />
    </Button>
  );
}
