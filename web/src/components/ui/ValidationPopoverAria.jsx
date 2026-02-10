// React Aria barely working popover component for validation messages, but glitchy as !@#$. Misplaced and no overlay arrow. This one follows usePopover from react-aria, rather than Popover from react-aria-components.
// Keeping it here for reference.
// Other version not using react-aria is in ValidationPopover.jsx, but not fully accessible.
// Will revisit later for a more polished solution.
import { useRef } from "react";
import { usePopover, DismissButton, Overlay } from "react-aria";

export function ValidationPopover({
  isOpen,
  onOpenChange,
  message,
  variant = "error",
  triggerRef,
}) {
  const popoverRef = useRef(null);

  const state = {
    isOpen,
    close: () => onOpenChange(false),
    open: () => onOpenChange(true),
    toggle: () => onOpenChange(!isOpen),
  };

  const { popoverProps, arrowProps, underlayProps, placement } = usePopover(
    {
      triggerRef,
      popoverRef,
      placement: "top",
      offset: 8,
      isNonModal: true,
    },
    state,
  );

  // Color mappings for each variant
  const colors = {
    error: {
      bg: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-200",
      fill: "#fef2f2", // red-50
      stroke: "#fecaca", // red-200
    },
    success: {
      bg: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-200",
      fill: "#f0fdf4", // green-50
      stroke: "#bbf7d0", // green-200
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-200",
      fill: "#fefce8", // yellow-50
      stroke: "#fef3c7", // yellow-200
    },
  };

  const currentColors = colors[variant];

  if (!isOpen || !message) return null;

  return (
    <Overlay>
      {/* Underlay - pointer-events-none to allow clicking input fields */}
      <div {...underlayProps} className="pointer-events-none fixed inset-0" />

      {/* Popover content */}
      <div
        {...popoverProps}
        ref={popoverRef}
        className={`pointer-events-auto z-50 max-w-xs rounded-xl border p-3 text-sm shadow-lg ${currentColors.bg}`}
      >
        {/* Arrow using arrowProps from usePopover */}
        <svg
          {...arrowProps}
          viewBox="0 0 12 12"
          style={{
            width: 12,
            height: 12,
            display: "block",
            fill: currentColors.fill,
            stroke: currentColors.stroke,
            strokeWidth: 1,
          }}
        >
          <path d="M0 0 L6 6 L12 0" />
        </svg>

        {/* Hidden dismiss button for keyboard accessibility */}
        <DismissButton onDismiss={state.close} />

        <div className="flex items-start justify-between gap-2">
          {/* Icon and message */}
          <div className="flex items-start gap-2">
            {variant === "error" && (
              <svg
                className="mt-0.5 size-4 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {variant === "success" && (
              <svg
                className="mt-0.5 size-4 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
            <span className="font-medium">{message}</span>
          </div>

          {/* Close button */}
          <button
            onClick={state.close}
            className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
            aria-label="Close"
          >
            <svg
              className="size-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Hidden dismiss button for keyboard accessibility */}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}
