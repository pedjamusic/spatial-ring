import { Link } from "react-router-dom";

/**
 * Preline default card: white bg, subtle border, shadow, rounded corners, with focus ring.
 * Size maps mimic Preline “Small/Default/Large” padding variants.
 */
export default function StatCard({
  label,
  value,
  to,
  size = "md",
  icon = null,
}) {
  const sizeMap = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <Link
      tabIndex={1}
      to={to}
      className={[
        "block rounded-md border border-gray-300 bg-white outline-1 -outline-offset-1 outline-gray-300 not-dark:shadow hover:border-gray-400 hover:outline-gray-400 focus:outline-2 focus:outline-blue-600 dark:border-neutral-700/25 dark:bg-neutral-800/50 dark:text-white dark:outline-neutral-700/25 dark:placeholder:text-gray-500 dark:hover:border-gray-700 dark:hover:outline-gray-700",
        sizeMap[size],
      ].join(" ")}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start gap-4">
        {icon ? <div className="text-gray-500">{icon}</div> : null}
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
      </div>
    </Link>
  );
}
