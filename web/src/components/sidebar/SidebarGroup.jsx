import React from "react";

export function SidebarGroup({ children, className = "" }) {
  return (
    <div className={`sidebar-group ${className}`} role="group">
      {children}
    </div>
  );
}
