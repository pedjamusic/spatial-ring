import { useState } from "react";
import { getMonthGrid, dayKey } from "./calendarUtils";
import CalendarDayCell from "./CalendarDayCell";
import EventDayPopover from "./EventDayPopover";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarYearView({
  year,
  dayMap,
  labelField,
  dateStartField,
  onMonthClick,
}) {
  const [popover, setPopover] = useState(null);

  const handleDayClick = (date, entries, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ date, entries, rect });
  };

  return (
    <div className="relative px-6 pb-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, m) => {
          const grid = getMonthGrid(year, m);
          return (
            <div key={m}>
              {/* Month header — clickable to switch to month view */}
              <button
                type="button"
                onClick={() => onMonthClick(m)}
                className="mb-3 text-sm font-semibold text-gray-800 hover:text-blue-600 dark:text-neutral-200 dark:hover:text-blue-400"
              >
                {MONTH_NAMES[m]}
              </button>

              {/* Weekday initials */}
              <div className="grid grid-cols-7 place-items-center">
                {WEEKDAY_INITIALS.map((d, i) => (
                  <span
                    key={i}
                    className="pb-1 text-xs text-gray-400 dark:text-neutral-500"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Mini day grid */}
              <div className="grid grid-cols-7 place-items-center gap-y-0.5">
                {grid.map((date) => {
                  const key = dayKey(date);
                  const entries = dayMap.get(key) || [];
                  return (
                    <CalendarDayCell
                      key={key}
                      date={date}
                      year={year}
                      month={m}
                      entries={entries}
                      size="sm"
                      labelField={labelField}
                      dateStartField={dateStartField}
                      onClick={(e) => handleDayClick(date, entries, e)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {popover && (
        <EventDayPopover
          date={popover.date}
          entries={popover.entries}
          triggerRect={popover.rect}
          labelField={labelField}
          dateStartField={dateStartField}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
