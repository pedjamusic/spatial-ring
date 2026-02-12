import { Label, Input } from "react-aria-components";
import { inputBase, inputNormal, inputError } from "../lib/formStyles";

export default function ValidatedField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  validation,
  showSuccess,
  autoComplete,
  ...inputProps
}) {
  const isInvalid = validation.state === "invalid";
  const errorId = `${id}-error`;

  const getInputClasses = (validationState) => {
    if (validationState === "invalid") {
      return `${inputBase} ${inputError}`;
    }
    if (validationState === "valid") {
      return `${inputBase} border-green-500 outline-green-500 focus:border-green-500 focus:outline-2 focus:-outline-offset-2 focus:outline-green-500 dark:border-green-500 dark:outline-green-500 dark:focus:border-green-500 dark:focus:outline-green-500`;
    }
    return `${inputBase} ${inputNormal}`;
  };

  return (
    <>
      <Label
        htmlFor={id}
        className="block text-sm leading-6 font-medium text-gray-900 dark:text-white"
      >
        {label}
      </Label>
      <div className="mt-2">
        <Input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={getInputClasses(validation.state)}
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? errorId : undefined}
          {...inputProps}
        />
        {isInvalid && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
          >
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {validation.message}
          </p>
        )}
        {showSuccess && validation.message && (
          <p className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            {validation.message}
          </p>
        )}
      </div>
    </>
  );
}
