import React from "react";
import { useSidebar } from "./useSidebar";
import { useButton } from "react-aria";
import { Menu } from "lucide-react";

export function BurgerMenu({ className = "" }) {
  const { toggleMobileDrawer, isMobile } = useSidebar();
  const ref = React.useRef(null);

  const { buttonProps } = useButton(
    {
      onPress: toggleMobileDrawer,
      "aria-label": "Toggle menu",
    },
    ref,
  );

  if (!isMobile) return null;

  return (
    <button
      ref={ref}
      {...buttonProps}
      className={`rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-700 ${className}`}
    >
      <Menu size={24} className="text-gray-700 dark:text-gray-300" />
    </button>
  );
}
