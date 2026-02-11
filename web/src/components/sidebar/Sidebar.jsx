import { useEffect } from "react";
import { useSidebar } from "./useSidebar";

export function Sidebar({ children, side = "left", className = "" }) {
  const { isMobile, isCollapsed, isOverlayOpen, closeOverlay } = useSidebar();

  // Close overlay on ESC key (mobile only)
  useEffect(() => {
    if (!isOverlayOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeOverlay();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen, closeOverlay]);

  const sidebarClasses = [
    "sidebar",
    isMobile ? "sidebar-mobile" : "sidebar-inline",
    !isMobile && (isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"),
    isOverlayOpen ? "sidebar-overlay-open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isMobile && isOverlayOpen && (
        <div className="sidebar-backdrop" onClick={closeOverlay} />
      )}
      <aside
        className={sidebarClasses}
        aria-label="Main navigation"
        data-state={isCollapsed && !isOverlayOpen ? "collapsed" : "expanded"}
        data-side={side}
      >
        <div className="sidebar-inner">{children}</div>
      </aside>
    </>
  );
}
