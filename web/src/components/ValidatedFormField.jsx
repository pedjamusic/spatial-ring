import { TextField, Label, Input } from "react-aria-components";
import { inputClasses } from "../lib/formStyles";

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
          className={inputClasses(showError)}
          {...inputProps}
        />
      </Label>
      {showError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </TextField>
  );
}
