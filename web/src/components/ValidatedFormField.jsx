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
      "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white focus:outline-hidden";

    if (showError) {
      return `${base} ring-red-500 focus:ring-red-500 dark:ring-red-500`;
    }
    return `${base} ring-gray-300 focus:ring-blue-600 dark:ring-gray-700`;
  };

  return (
    <TextField>
      <Label
        htmlFor={id}
        className="block text-sm leading-6 font-medium text-gray-900 dark:text-white"
      >
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}

        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={getInputClasses()}
          {...inputProps}
        />
      </Label>
      {showError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </TextField>
  );
}
