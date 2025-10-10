export function SidebarMenuItem({ children, className = "" }) {
  return <li className={`sidebar-menu-item ${className}`}>{children}</li>;
}
