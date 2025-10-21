import { Link } from "react-router-dom";

type StatCardProps = {
  label: string;
  value: number | string;
  to: string; // CRUD route
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
};

const sizeMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function StatCard({
  label,
  value,
  to,
  size = "md",
  icon,
}: StatCardProps) {
  return (
    <Link
      to={to}
      className={[
        "block rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none",
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
