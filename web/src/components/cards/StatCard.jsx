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
      to={to}
      className={[
        "block rounded-xl border bg-white shadow-sm",
        "transition-shadow hover:shadow-md",
        "focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none",
        sizeMap[size],
      ].join(" ")}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start gap-4">
        {icon ? <div className="text-gray-500">{icon}</div> : null}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </Link>
  );
}
