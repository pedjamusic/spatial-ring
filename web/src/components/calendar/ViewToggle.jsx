import { List, CalendarDays, Calendar } from "lucide-react";

const VIEW_OPTIONS = [
  { value: "table", label: "Table", Icon: List },
  { value: "month", label: "Month", Icon: CalendarDays },
  { value: "year", label: "Year", Icon: Calendar },
];

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl shadow-2xs" role="group">
      {VIEW_OPTIONS.map(({ value: v, label, Icon }, i) => {
        const active = value === v;
        const first = i === 0;
        const last = i === VIEW_OPTIONS.length - 1;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={[
              "inline-flex items-center gap-x-1.5 px-3 py-2 text-sm font-medium transition-colors",
              first && "rounded-l-md",
              last && "rounded-r-md",
              !first && "-ml-px",
              active
                ? "border border-blue-600 bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
