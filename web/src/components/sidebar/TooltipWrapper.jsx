import React, { useRef, useState } from "react";
import { useTooltipTrigger } from "react-aria";
import { useTooltipTriggerState } from "react-stately";
import { useSidebar } from "./useSidebar";

export function TooltipWrapper({ children, content, delay = 700 }) {
  const { isCollapsed, isMobile, showMobileDrawer } = useSidebar();
  const state = useTooltipTriggerState({ delay });
  const ref = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });

  const { triggerProps, tooltipProps } = useTooltipTrigger(
    { delay },
    state,
    ref,
  );

  // Only show tooltips when collapsed and not showing mobile drawer
  const shouldShowTooltip =
    (isCollapsed || isMobile) && !showMobileDrawer && state.isOpen;

  // Update tooltip position when it opens
  React.useEffect(() => {
    if (state.isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPosition({ top: rect.top });
    }
  }, [state.isOpen]);

  return (
    <div className="relative">
      <div ref={ref} {...triggerProps} className="w-full">
        {children}
      </div>
      {shouldShowTooltip && (
        <div
          {...tooltipProps}
          className="fixed left-[4.5rem] z-50 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium whitespace-nowrap text-white shadow-lg dark:bg-gray-700"
          style={{
            top: `${tooltipPosition.top}px`,
          }}
        >
          {content}
          <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
        </div>
      )}
    </div>
  );
}
