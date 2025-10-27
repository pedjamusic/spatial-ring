// web/src/components/sidebar/SidebarProvider.jsx
import { useState, useEffect } from "react";
import { SidebarContext } from "./SidebarContext";

export function SidebarProvider({
  children,
  defaultOpen = true,
  onOpenChange,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // useEffect(() => {
  //   const checkMobile = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };

  //   checkMobile();
  //   window.addEventListener("resize", checkMobile);
  //   return () => window.removeEventListener("resize", checkMobile);
  // }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      const collapsed = window.innerWidth >= 768 && window.innerWidth < 1024;

      setIsMobile(mobile);
      setIsCollapsed(collapsed);

      // Auto-close drawer on desktop
      // if (!mobile && showMobileDrawer) {
      //   setShowMobileDrawer(false);
      // }
      // ^^^ Do NOT auto-close the drawer on desktop; allow overlay while collapsed
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [showMobileDrawer]);

  const toggleSidebar = () => {
    const newState = !open;
    setOpen(newState);
    onOpenChange?.(newState);
  };

  const toggleMobileDrawer = () => {
    setShowMobileDrawer(!showMobileDrawer);
  };

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggleSidebar,
        isMobile,
        isCollapsed,
        showMobileDrawer,
        toggleMobileDrawer,
        state: open ? "expanded" : "collapsed",
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
