export function SidebarMenu({ children, className = "" }) {
  return (
    <nav className={`sidebar-menu ${className}`}>
      <ul role="list">{children}</ul>
    </nav>
  );
}
