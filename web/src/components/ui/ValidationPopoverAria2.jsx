import { Popover, OverlayArrow, Button } from "react-aria-components";
import { DismissButton } from "react-aria";

export function ValidationPopover({
  isOpen,
  onOpenChange,
  message,
  variant = "error",
  triggerRef,
}) {
  if (!isOpen || !message) return null; // nothing to show

  /* ----------  Preline-style colour maps  ---------- */
  const bg = {
    error:
      "bg-red-50  border-red-200  text-red-800  dark:bg-red-900/50  dark:border-red-700  dark:text-red-200",
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-200",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-200",
  }[variant];

  const arrow = {
    error:
      "fill-red-50   stroke-red-200   dark:fill-red-900/50   dark:stroke-red-700",
    success:
      "fill-green-50 stroke-green-200 dark:fill-green-900/50 dark:stroke-green-700",
    warning:
      "fill-yellow-50 stroke-yellow-200 dark:fill-yellow-900/50 dark:stroke-yellow-700",
  }[variant];

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      triggerRef={triggerRef} /* anchor */
      placement="top"
      offset={8}
      isDismissable /* outside click / Esc closes */
      isNonModal /* no focus trapping */
      className={`z-50 max-w-xs rounded-lg border p-3 text-sm shadow-lg ${bg}`}
    >
      {/* two hidden buttons give keyboard users an escape route */}
      <DismissButton onDismiss={() => onOpenChange(false)} />

      <OverlayArrow>
        <svg width="12" height="6" viewBox="0 0 12 6" className={arrow}>
          <path d="M0 6L6 0L12 6" />
        </svg>
      </OverlayArrow>

      <div className="flex items-start justify-between gap-2">
        {/* left side: icon + text */}
        <div className="flex items-start gap-2">
          {variant === "error" && (
            <svg
              className="mt-0.5 size-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth="2"
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
              strokeWidth="2"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
          <span className="font-medium">{message}</span>
        </div>

        {/* close icon */}
        <Button
          onPress={() => onOpenChange(false)}
          aria-label="Close"
          className="size-5 shrink-0 rounded-lg opacity-60 transition hover:opacity-100 focus:outline-none"
        >
          <svg
            className="size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {/* second hidden button to catch Shift-Tab */}
      <DismissButton onDismiss={() => onOpenChange(false)} />
    </Popover>
  );
}
