export function SidebarGroupLabel({ children, className = "" }) {
  return (
    <div className={`sidebar-group-label pl-2.5 font-bold ${className}`}>
      {children}
    </div>
  );
}
