export function SidebarMenuItem({ children, className = "" }) {
  return (
    <li
      className={`sidebar-menu-item text-md font-bold last:mb-2 ${className}`}
    >
      {children}
    </li>
  );
}
