// web/src/components/sidebar/SidebarProvider.jsx
import { useState, useEffect, useCallback } from "react";
import { SidebarContext } from "./SidebarContext";

export function SidebarProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile((prev) => {
        if (prev !== mobile) {
          // Reset states on viewport change
          setIsCollapsed(mobile ? true : false);
          setIsOverlayOpen(false);
        }
        return mobile;
      });
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsOverlayOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  // On mobile, sidebar is always collapsed inline; overlay controls the expanded state
  // On desktop, isCollapsed controls expanded/collapsed
  const shouldHideLabels = isMobile ? !isOverlayOpen : isCollapsed;

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        isCollapsed: isMobile ? true : isCollapsed,
        isOverlayOpen,
        shouldHideLabels,
        toggleSidebar,
        closeOverlay,
        state: shouldHideLabels ? "collapsed" : "expanded",
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
