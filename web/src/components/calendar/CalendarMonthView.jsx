import { useState } from "react";
import { getMonthGrid, dayKey } from "./calendarUtils";
import CalendarDayCell from "./CalendarDayCell";
import EventDayPopover from "./EventDayPopover";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonthView({
  year,
  month,
  dayMap,
  labelField,
  dateStartField,
}) {
  const grid = getMonthGrid(year, month);
  const [popover, setPopover] = useState(null);

  const handleDayClick = (date, entries, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ date, entries, rect });
  };

  return (
    <div className="relative">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-neutral-700">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {grid.map((date) => {
          const key = dayKey(date);
          const entries = dayMap.get(key) || [];
          return (
            <CalendarDayCell
              key={key}
              date={date}
              year={year}
              month={month}
              entries={entries}
              size="lg"
              labelField={labelField}
              dateStartField={dateStartField}
              onClick={(e) => handleDayClick(date, entries, e)}
            />
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
