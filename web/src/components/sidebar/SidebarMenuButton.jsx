// web/src/components/sidebar/SidebarMenuButton.jsx
import { Link, useLocation } from "react-router-dom";
import { useFocusRing } from "react-aria";

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

  return (
    <Link
      to={to}
      className={`
        inline-flex items-center hover:bg-gray-200 rounded-md gap-2 text-gray-700 p-1
        sidebar-menu-button dark:hover:bg-neutral-700/50 dark:text-gray-100/75
        ${active ? "sidebar-menu-button-active" : ""}
        ${isFocusVisible ? "focus-visible" : ""}
        ${className}
      `}
      aria-current={active ? "page" : undefined}
      {...focusProps}
    >
      {Icon && (
        <Icon
          className="sidebar-icon"
          aria-hidden="true"
          size={16}
          strokeWidth={1}
          absoluteStrokeWidth
        />
      )}
      <span className="sidebar-label">{children}</span>
    </Link>
  );
}
