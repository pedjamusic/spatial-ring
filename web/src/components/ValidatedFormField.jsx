import { TextField, Label, Input } from "react-aria-components";

/**
 * Reusable validated form field with error display
 * Shows red border and error message when invalid
 */
export default function ValidatedFormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  required = false,
  error = null,
  touched = false,
  className = "",
  ...inputProps
}) {
  const showError = touched && error;

  const getInputClasses = () => {
    const base =
      "block w-full rounded-xl border bg-white px-3 py-1.5  text-base text-gray-900 outline-1 -outline-offset-1 placeholder:text-gray-400 not-dark:shadow-sm  placeholder:text-gray-400 sm:text-sm sm:leading-6  dark:bg-neutral-800/50 dark:text-white";

    if (showError) {
      return `${base} border-red-600 outline-red-600 focus:outline-2 focus:-outline-offset-2`;
    }
    return `${base} border-gray-300 outline-gray-300 hover:border-gray-400 hover:outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:border-neutral-700/50 dark:outline-neutral-700/50 dark:bg-neutral-800 dark:placeholder:text-gray-500 dark:hover:border-neutral-600 dark:hover:outline-neutral-600 dark:focus:outline-blue-500`;
  };

  return (
    <TextField>
      <Label
        htmlFor={id}
        className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
      >
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}

        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          // className={getInputClasses()}
          className={`not-dark:shadow-sm block w-full rounded-xl border bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 ring-0 focus:outline-2 focus:-outline-offset-2 sm:text-sm sm:leading-6 dark:bg-neutral-800/50 dark:text-white ${
            showError
              ? "border-red-600 outline-red-600 focus:border-red-600 focus:outline-red-600"
              : "border-gray-300 outline-gray-300 hover:border-gray-400 hover:outline-gray-400 focus:border-blue-600 focus:outline-blue-600 dark:border-neutral-700/50 dark:outline-neutral-700/50 dark:hover:border-neutral-600 dark:hover:outline-neutral-600 dark:focus:border-blue-600 dark:focus:outline-blue-600"
          }`}
          {...inputProps}
        />
      </Label>
      {showError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </TextField>
  );
}
