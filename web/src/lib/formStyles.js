// Base classes shared by all inputs, selects, textareas
export const inputBase =
  "block w-full rounded-xl border bg-white px-3 py-1.5 text-base text-gray-900 ring-0 outline-1 -outline-offset-1 not-dark:shadow-sm sm:text-sm sm:leading-6 dark:bg-neutral-800/50 dark:text-white";

// Normal (non-error) border/outline/focus/dark
export const inputNormal =
  "border-gray-300 outline-gray-300 hover:border-gray-400 hover:outline-gray-400 focus:border-blue-600 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:border-neutral-700/50 dark:outline-neutral-700/50 dark:hover:border-neutral-600 dark:hover:outline-neutral-600 dark:focus:border-blue-600 dark:focus:outline-blue-600";

// Error state
export const inputError =
  "border-red-600 outline-red-600 focus:border-red-600 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600";

// Helper
export const inputClasses = (hasError) =>
  `${inputBase} ${hasError ? inputError : inputNormal}`;
