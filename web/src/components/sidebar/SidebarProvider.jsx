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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    const newState = !open;
    setOpen(newState);
    onOpenChange?.(newState);
  };

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggleSidebar,
        isMobile,
        state: open ? "expanded" : "collapsed",
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
