import { useSidebar } from "./useSidebar";

export function Sidebar({
  children,
  side = "left",
  variant = "sidebar",
  className = "",
}) {
  const {
    // open,
    isMobile,
    isCollapsed,
    showMobileDrawer,
    toggleMobileDrawer,
  } = useSidebar();

  // Determine state for original classes
  // Base sidebar state: mini when collapsed on desktop; full on mobile only when drawer open
  const isOpen = isMobile ? showMobileDrawer : !isCollapsed;

  return (
    <>
      {/* Overlay for drawer */}
      {showMobileDrawer && (
        <div
          className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileDrawer}
          aria-hidden="true"
        />
      )}
      {!showMobileDrawer && (
        <aside
          className={`sidebar ${variant === "floating" ? "sidebar-floating" : ""} ${isOpen ? "sidebar-open" : "sidebar-collapsed"} ${isMobile ? "sidebar-mobile" : "sidebar-desktop"} ${className} `}
          aria-label="Main navigation"
          data-state={isOpen ? "expanded" : "collapsed"}
          // data-state={isCollapsed || isMobile ? "collapsed" : "expanded"}
          data-side={side}
        >
          <div className="sidebar-inner">{children}</div>
        </aside>
      )}
      {/* Drawer sidebar: overlays on top, does NOT affect layout */}
      {showMobileDrawer && (
        <aside
          className={`sidebar sidebar-floating sidebar-open z-[50] h-screen`}
          aria-label="Overlay navigation"
          data-side={side}
        >
          <div className="sidebar-inner">{children}</div>
        </aside>
      )}
    </>
  );
}
