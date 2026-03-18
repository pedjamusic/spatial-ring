export function SidebarSeparator({ className = "" }) {
  return (
    <div
      className={`sidebar-separator ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
