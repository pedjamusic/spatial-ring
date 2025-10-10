export function SidebarContent({ children, className = "" }) {
  return <div className={`sidebar-content ${className}`}>{children}</div>;
}
