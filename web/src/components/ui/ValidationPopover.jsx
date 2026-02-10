// Custom working popover component for validation messages, but not using react-aria and not fully accessible.
// Keeping it here for reference.
// New version using react-aria is in ValidationPopoverAria.jsx, but glitchy with positioning and focus management and arrow issues (either white or missing).
// Will revisit later for a more polished solution.
import { useRef, useEffect } from "react";

export function ValidationPopover({
  isOpen,
  onOpenChange,
  message,
  variant = "error",
  triggerRef,
}) {
  const popoverRef = useRef(null);

  const variantClasses = {
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-200",
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-200",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-200",
  };

  // Position the popover relative to the trigger element
  useEffect(() => {
    if (isOpen && triggerRef?.current && popoverRef.current) {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      const rect = trigger.getBoundingClientRect();

      // Position above the input field
      popover.style.position = "fixed";
      popover.style.left = `${rect.left}px`;
      popover.style.top = `${rect.top - popover.offsetHeight - 8}px`;
      popover.style.zIndex = "50";
    }
  }, [isOpen, triggerRef]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onOpenChange, triggerRef]);

  if (!isOpen || !message) return null;

  return (
    <div
      ref={popoverRef}
      className={`fixed max-w-xs rounded-xl border p-3 text-sm shadow-lg ${variantClasses[variant]} `}
    >
      {/* Arrow */}
      <div className="absolute top-full left-4 h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-red-200 dark:border-t-red-700"></div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {variant === "error" && (
            <svg
              className="mt-0.5 size-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          {variant === "success" && (
            <svg
              className="mt-0.5 size-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5"></path>
            </svg>
          )}
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg
            className="size-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}
