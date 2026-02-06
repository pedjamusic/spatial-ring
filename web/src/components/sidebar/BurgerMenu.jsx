import { Button } from "react-aria-components";
import { Menu } from "lucide-react";
import { useSidebar } from "./useSidebar";

export function BurgerMenu({ className = "" }) {
  const { isMobile, toggleMobileDrawer } = useSidebar();

  // Only show on mobile/tablet (< 1024px)
  if (!isMobile) {
    return null;
  }

  return (
    <Button
      onPress={toggleMobileDrawer}
      className={`rounded-lg p-2 text-gray-700 hover:cursor-pointer hover:bg-gray-200 dark:text-gray-100/75 dark:hover:bg-neutral-700/50 ${className}`}
      aria-label="Open navigation menu"
    >
      <Menu size={24} />
    </Button>
  );
}
