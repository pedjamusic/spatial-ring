const variantStyles = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  yellow:
    "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  green:
    "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function Badge({ children, variant = "blue", className = "" }) {
  return (
    <span
      className={[
        "inline-flex rounded-md px-3 py-1 text-xs font-medium",
        variantStyles[variant] || variantStyles.blue,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
