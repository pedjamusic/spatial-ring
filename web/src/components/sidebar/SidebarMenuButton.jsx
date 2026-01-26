// web/src/components/sidebar/SidebarMenuButton.jsx
import { Link, useLocation } from "react-router-dom";
import { useFocusRing } from "react-aria";

import { useSidebar } from "./useSidebar";
import { TooltipWrapper } from "./TooltipWrapper";

export function SidebarMenuButton({
  to,
  icon: Icon,
  children,
  isActive,
  className = "",
}) {
  const location = useLocation();
  const active = isActive ?? location.pathname.startsWith(to);
  const { isFocusVisible, focusProps } = useFocusRing();
  // const { isCollapsed, isMobile } = useSidebar();
  // Destructure all needed values from the single hook call
  const { isCollapsed, isMobile, showMobileDrawer } = useSidebar();

  const shouldCollapse =
    // isCollapsed || (isMobile && !useSidebar().showMobileDrawer);
    isCollapsed || (isMobile && !showMobileDrawer);

  const buttonContent = (
    <Link
      to={to}
      className={`sidebar-menu-button inline-flex items-center gap-2 rounded-md p-1 text-gray-700 hover:bg-gray-200 dark:text-gray-100/75 dark:hover:bg-neutral-700/50 ${active ? "sidebar-menu-button-active" : ""} ${isFocusVisible ? "focus-visible" : ""} ${shouldCollapse ? "w-full justify-center" : ""} ${className} `}
      aria-current={active ? "page" : undefined}
      {...focusProps}
    >
      {Icon && (
        <Icon
          className="sidebar-icon"
          aria-hidden="true"
          size={!shouldCollapse ? 16 : 24}
          strokeWidth={!shouldCollapse ? 1 : 1.5}
        />
      )}
      {!shouldCollapse && (
        // <span className="sidebar-label truncate">{children}</span>
        <span className="sidebar-label">{children}</span>
      )}
    </Link>
  );

  // Wrap with tooltip only when collapsed
  if (shouldCollapse) {
    return <TooltipWrapper content={children}>{buttonContent}</TooltipWrapper>;
  }

  return buttonContent;
}
