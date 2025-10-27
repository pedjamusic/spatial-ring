import React from "react";
import { useSidebar } from "./useSidebar";
import { useButton } from "react-aria";
import { Button } from "react-aria-components";
import { Menu } from "lucide-react";

export function BurgerMenu({ className = "" }) {
  const { toggleMobileDrawer, isMobile, isCollapsed } = useSidebar();
  const ref = React.useRef(null);

  const { buttonProps } = useButton(
    {
      onPress: toggleMobileDrawer,
      "aria-label": "Toggle menu",
    },
    ref,
  );

  // Show when either collapsed (desktop/tablet) OR mobile
  if (!(isCollapsed || isMobile)) return null;

  return (
    <Button
      ref={ref}
      {...buttonProps}
      className={`rounded-lg p-2 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700/50 ${className}`}
    >
      <Menu size={24} className="text-gray-700 dark:text-gray-300" />
    </Button>
  );
}
