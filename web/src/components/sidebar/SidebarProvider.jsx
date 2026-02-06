// web/src/components/sidebar/SidebarProvider.jsx
import { useState, useEffect } from "react";
import { SidebarContext } from "./SidebarContext";

export function SidebarProvider({ children }) {
  // Viewport detection
  const [viewportSize, setViewportSize] = useState("desktop");

  // Mobile drawer state (overlay)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Collapsed state for tablet/desktop (toggleable)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Detect viewport size and set default collapsed state
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;

      let newViewportSize;
      let defaultCollapsed;

      if (width < 1024) {
        // Mobile + Tablet: use overlay drawer
        newViewportSize = "mobile";
        defaultCollapsed = false; // Doesn't matter for mobile/tablet
      } else {
        // Desktop: inline sidebar with toggle
        newViewportSize = "desktop";
        defaultCollapsed = false; // Expanded by default on desktop
      }

      // Only update collapsed state when viewport size changes
      setViewportSize((prev) => {
        if (prev !== newViewportSize) {
          setIsCollapsed(defaultCollapsed);
          // Close mobile drawer when switching to desktop
          if (newViewportSize === "desktop") {
            setIsMobileDrawerOpen(false);
          }
        }
        return newViewportSize;
      });
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleCollapsed = () => {
    if (viewportSize !== "mobile") {
      setIsCollapsed((prev) => !prev);
    }
  };

  const openMobileDrawer = () => {
    if (viewportSize === "mobile") {
      setIsMobileDrawerOpen(true);
    }
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  const toggleMobileDrawer = () => {
    if (viewportSize === "mobile") {
      setIsMobileDrawerOpen((prev) => !prev);
    }
  };

  const isMobile = viewportSize === "mobile";

  return (
    <SidebarContext.Provider
      value={{
        viewportSize,
        isMobile,
        isCollapsed,
        isMobileDrawerOpen,
        toggleCollapsed,
        openMobileDrawer,
        closeMobileDrawer,
        toggleMobileDrawer,
        // Computed state for convenience
        state: isCollapsed ? "collapsed" : "expanded",
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
