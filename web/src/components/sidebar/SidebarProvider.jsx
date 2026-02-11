// web/src/components/sidebar/SidebarProvider.jsx
import { useState, useEffect, useCallback } from "react";
import { SidebarContext } from "./SidebarContext";

const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_LARGE = 1280;

export function SidebarProvider({ children }) {
  const [viewport, setViewport] = useState("large"); // "mobile" | "medium" | "large"
  const [isExpanded, setIsExpanded] = useState(true); // non-mobile: expanded vs collapsed (4rem)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false); // mobile: overlay open

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      let newViewport;
      if (width < BREAKPOINT_MOBILE) {
        newViewport = "mobile";
      } else if (width < BREAKPOINT_LARGE) {
        newViewport = "medium";
      } else {
        newViewport = "large";
      }

      setViewport((prev) => {
        if (prev !== newViewport) {
          setIsOverlayOpen(false);
          // Large: expanded by default, medium: collapsed by default
          setIsExpanded(newViewport === "large");
        }
        return newViewport;
      });
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (viewport === "mobile") {
      setIsOverlayOpen((prev) => !prev);
    } else {
      // Medium and large: toggle expanded/collapsed (4rem strip stays)
      setIsExpanded((prev) => !prev);
    }
  }, [viewport]);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  const isMobile = viewport === "mobile";
  // Non-mobile: collapsed means 4rem icon strip. Mobile: always collapsed (hidden).
  const isCollapsed = isMobile ? true : !isExpanded;
  // Mobile: never hide labels — overlay uses width:0 + overflow:hidden to clip
  const shouldHideLabels = isMobile ? false : isCollapsed;

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        viewport,
        isCollapsed,
        isExpanded,
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
