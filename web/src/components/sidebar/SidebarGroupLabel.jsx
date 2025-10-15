export function SidebarGroupLabel({ children, className = "" }) {
  return (
    <div className={`sidebar-group-label pl-1 ${className}`}>{children}</div>
  );
}
