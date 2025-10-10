import { useSidebar } from "./useSidebar";

export function Sidebar({
  children,
  side = "left",
  variant = "sidebar",
  className = "",
}) {
  const { open, isMobile } = useSidebar();

  return (
    <aside
      className={`
        sidebar
        ${variant === "floating" ? "sidebar-floating" : ""}
        ${open ? "sidebar-open" : "sidebar-collapsed"}
        ${isMobile ? "sidebar-mobile" : "sidebar-desktop"}
        ${className}
      `}
      aria-label="Main navigation"
      data-state={open ? "expanded" : "collapsed"}
      data-side={side}
    >
      <div className="sidebar-inner">{children}</div>
    </aside>
  );
}
