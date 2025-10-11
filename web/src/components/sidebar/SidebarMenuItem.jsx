export function SidebarMenuItem({ children, className = "" }) {
  return (
    <li className={`sidebar-menu-item text-sm last:mb-2 ${className}`}>
      {children}
    </li>
  );
}
