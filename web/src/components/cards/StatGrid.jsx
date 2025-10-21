import StatCard from "./StatCard";

/**
 * Presentational grid for four stats; keeps visuals and layout only.
 */
export default function StatGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard
          key={s.label}
          label={s.label}
          value={s.value}
          to={s.to}
          size={s.size || "md"}
          icon={s.icon}
        />
      ))}
    </div>
  );
}
