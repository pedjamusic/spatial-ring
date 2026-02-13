import React from "react";

export function SidebarHeader({ children, className = "" }) {
  return (
    <div className={`sidebar-header mb-4 mt-2 pb-4 ${className}`} role="banner">
      {children}
    </div>
  );
}
