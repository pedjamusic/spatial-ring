import {
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_Toast as AriaToast,
  Button,
} from "react-aria-components";

import { toastQueue } from "../../lib/toastQueue";

// Toast icons for different variants
const ToastIcon = ({ variant }) => {
  const icons = {
    error: (
      <svg
        className="size-4 shrink-0"
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
    ),
    success: (
      <svg
        className="size-4 shrink-0"
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
    ),
    warning: (
      <svg
        className="size-4 shrink-0"
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
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
        <path d="M12 9v4"></path>
        <path d="M12 17h.01"></path>
      </svg>
    ),
    info: (
      <svg
        className="size-4 shrink-0"
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
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
      </svg>
    ),
  };

  return icons[variant] || icons.info;
};

// Toast component styled like Preline
export function Toast({ toast }) {
  // const variant = toast.variant || "info";
  const { message = "", variant = "info" } = toast.content;

  const colorClasses = {
    error: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
    success:
      "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  };

  return (
    <AriaToast
      toast={toast}
      className="animate-in slide-in-from-bottom-5 max-w-xs rounded-md border border-gray-200 bg-white shadow-lg duration-300 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div className="flex p-4">
        <div className="shrink-0">
          <div
            className={`inline-flex size-8 items-center justify-center rounded-lg ${
              colorClasses[variant]
            }`}
          >
            <ToastIcon variant={variant} />
          </div>
        </div>
        <div className="ms-3 flex-1">
          <p className="text-sm text-gray-700 dark:text-neutral-400">
            {/* {toast.content} */}
            {message}
          </p>
        </div>
        <div className="ms-auto">
          <Button
            slot="close"
            onPress={() => toast.close()}
            aria-label="Close"
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-lg text-gray-800 opacity-50 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none dark:text-white"
          >
            <span className="sr-only">Close</span>
            <svg
              className="size-4 shrink-0"
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
          </Button>
        </div>
      </div>
    </AriaToast>
  );
}

// Toast Region Component
export function AppToastRegion() {
  return (
    <ToastRegion
      queue={toastQueue}
      className="fixed right-5 bottom-5 z-50 flex max-w-xs flex-col gap-2"
    >
      {({ toast }) => <Toast toast={toast} />}
    </ToastRegion>
  );
}
