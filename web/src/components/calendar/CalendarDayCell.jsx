import { isToday, isInMonth } from "./calendarUtils";

const PILL_STYLES = {
  start: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  single: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  ongoing: "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400",
  end: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const INDICATOR_COLORS = {
  start: "bg-teal-600",
  single: "bg-teal-600",
  ongoing: "bg-blue-300 dark:bg-blue-500",
  end: "bg-amber-500",
};

/**
 * A single day cell used by both month and year views.
 * size="lg" → month view (Preline-style event pills)
 * size="sm" → year view (dots only)
 */
export default function CalendarDayCell({
  date,
  year,
  month,
  entries = [],
  size = "lg",
  onClick,
  labelField,
}) {
  const inMonth = isInMonth(date, year, month);
  const today = isToday(date);
  const hasEvents = entries.length > 0;

  const dayNum = date.getDate();

  // --- Year view (compact, dots only) ---
  if (size === "sm") {
    const starts = entries.filter(
      (e) => e.classification === "start" || e.classification === "single",
    );
    const ongoing = entries.filter((e) => e.classification === "ongoing");
    const ends = entries.filter((e) => e.classification === "end");

    return (
      <button
        type="button"
        onClick={hasEvents ? onClick : undefined}
        className={[
          "flex size-6 flex-col items-center justify-center rounded text-xs",
          !inMonth && "text-gray-300 dark:text-neutral-600",
          inMonth && !today && "text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-700",
          today && "font-bold text-blue-600",
          hasEvents && "cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span>{dayNum}</span>
        {hasEvents && (
          <div className="mt-0.5 flex gap-0.5">
            {starts.length > 0 && (
              <span
                className={`inline-block rounded-full bg-teal-600 ${starts.length > 1 ? "h-1 w-2" : "size-1"}`}
              />
            )}
            {ongoing.length > 0 && (
              <span
                className={`inline-block h-1 rounded-full bg-blue-300 dark:bg-blue-500 ${ongoing.length > 1 ? "w-2.5" : "w-1.5"}`}
              />
            )}
            {ends.length > 0 && (
              <span
                className={`inline-block rounded-full bg-amber-500 ${ends.length > 1 ? "h-1 w-2" : "size-1"}`}
              />
            )}
          </div>
        )}
      </button>
    );
  }

  // --- Month view (Preline-style: event pills with name + time) ---
  return (
    <button
      type="button"
      onClick={hasEvents ? onClick : undefined}
      className={[
        "flex min-h-[6.5rem] flex-col border-t border-gray-200 px-1.5 pt-1.5 pb-1 text-left dark:border-neutral-700",
        !inMonth && "bg-gray-50/50 dark:bg-neutral-800/30",
        inMonth && "bg-white dark:bg-transparent",
        hasEvents && "cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Day number */}
      <span
        className={[
          "mb-1 inline-flex size-7 items-center justify-center rounded-full text-base",
          !inMonth && "text-gray-400 dark:text-neutral-500",
          inMonth && !today && "text-gray-800 dark:text-neutral-200",
          today && "bg-blue-600 font-semibold text-white",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {dayNum}
      </span>

      {/* Event pills */}
      {hasEvents && (
        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          {entries.slice(0, 2).map((entry) => (
              <div
                key={`${entry.event.id}-${entry.classification}`}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs leading-tight ${PILL_STYLES[entry.classification]}`}
              >
                <span
                  className={`inline-block size-1.5 shrink-0 rounded-full ${INDICATOR_COLORS[entry.classification]}`}
                />
                <span className="truncate font-medium">
                  {entry.event[labelField]}
                </span>
              </div>
            ))}
          {entries.length > 2 && (
            <div
              className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs leading-tight text-gray-500 dark:bg-neutral-700/40 dark:text-neutral-400"
              aria-label={`${entries.length - 2} more events`}
            >
              <span className="flex gap-px">
                <span className="size-0.5 rounded-full bg-current" />
                <span className="size-0.5 rounded-full bg-current" />
                <span className="size-0.5 rounded-full bg-current" />
              </span>
              <span className="font-medium">+{entries.length - 2} more</span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
