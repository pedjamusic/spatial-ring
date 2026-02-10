import { Label, Input } from "react-aria-components";

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
  const getInputClasses = (validationState) => {
    const base =
      "block w-full rounded-xl border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white focus:outline-hidden";

    if (validationState === "invalid") {
      return `${base} ring-red-500 focus:ring-red-500 dark:ring-red-500`;
    }
    if (validationState === "valid") {
      return `${base} ring-green-500 focus:ring-green-500 dark:ring-green-500`;
    }
    return `${base} ring-gray-300 focus:ring-blue-600 dark:ring-gray-700`;
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
          {...inputProps}
        />
        {validation.state === "invalid" && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {validation.message}
          </p>
        )}
        {showSuccess && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            {validation.message}
          </p>
        )}
      </div>
    </>
  );
}
