import { Modal, ModalOverlay, Dialog } from "react-aria-components";
import { useSidebar } from "./useSidebar";

export function Sidebar({ children, side = "left", className = "" }) {
  const {
    isMobile,
    isCollapsed,
    isMobileDrawerOpen,
    closeMobileDrawer,
  } = useSidebar();

  // Mobile/Tablet (< 1024px): Render as Modal overlay
  if (isMobile) {
    return (
      <ModalOverlay
        isOpen={isMobileDrawerOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeMobileDrawer();
        }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        isDismissable
      >
        <Modal className="fixed inset-y-0 left-0 w-64 outline-none">
          <Dialog className="h-full outline-none">
            {({ close }) => (
              <aside
                className={`sidebar sidebar-mobile ${className}`}
                aria-label="Main navigation"
                data-state="expanded"
                data-side={side}
              >
                <div className="sidebar-inner">{children}</div>
              </aside>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }

  // Desktop (≥ 1024px): Render as sticky sidebar
  return (
    <aside
      className={`sidebar sidebar-desktop ${isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"} ${className}`}
      aria-label="Main navigation"
      data-state={isCollapsed ? "collapsed" : "expanded"}
      data-side={side}
    >
      <div className="sidebar-inner">{children}</div>
    </aside>
  );
}
