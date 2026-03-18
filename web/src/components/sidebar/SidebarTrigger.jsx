// web/src/components/sidebar/SidebarTrigger.jsx
import React from "react";
import { useSidebar } from "./useSidebar";
import { useButton } from "react-aria";

export function SidebarTrigger({ className = "" }) {
  const { toggleSidebar, open } = useSidebar();
  const ref = React.useRef(null);

  const { buttonProps } = useButton(
    {
      onPress: toggleSidebar,
      "aria-label": open ? "Close sidebar" : "Open sidebar",
    },
    ref,
  );

  return (
    <button
      ref={ref}
      {...buttonProps}
      className={`sidebar-trigger ${className} border border-red-600`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
    </button>
  );
}
