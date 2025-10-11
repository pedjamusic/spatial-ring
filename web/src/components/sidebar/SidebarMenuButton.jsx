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
        block hover:bg-gray-200 rounded-md p-1
        sidebar-menu-button
        ${active ? "sidebar-menu-button-active" : ""}
        ${isFocusVisible ? "focus-visible" : ""}
        ${className}
      `}
      aria-current={active ? "page" : undefined}
      {...focusProps}
    >
      {Icon && <Icon className="sidebar-icon" aria-hidden="true" />}
      <span className="sidebar-label">{children}</span>
    </Link>
  );
}
