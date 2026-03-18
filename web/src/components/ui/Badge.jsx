const variantStyles = {
  blue: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]",
  yellow: "bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)]",
  red: "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]",
  green: "bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]",
  gray: "bg-[var(--badge-gray-bg)] text-[var(--badge-gray-text)]",
};

export default function Badge({ children, variant = "blue", className = "" }) {
  return (
    <span
      className={[
        "inline-flex rounded-xl px-3 py-1 text-xs font-medium",
        variantStyles[variant] || variantStyles.blue,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
