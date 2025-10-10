import React from "react";

export function SidebarHeader({ children, className = "" }) {
  return (
    <div className={`sidebar-header ${className}`} role="banner">
      {children}
    </div>
  );
}
