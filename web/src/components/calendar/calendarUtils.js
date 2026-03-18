/**
 * Returns a 6×7 grid of Date objects for a given month, padded with
 * leading/trailing days to fill complete weeks (Sun–Sat).
 */
export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(1 - firstDay.getDay()); // back to Sunday

  const grid = [];
  const cursor = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    grid.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return grid;
}

/** Returns { start, end } ISO strings spanning the full visible month grid. */
export function getMonthRange(year, month) {
  const grid = getMonthGrid(year, month);
  return {
    start: toISODateTime(grid[0], "00:00:00.000"),
    end: toISODateTime(grid[grid.length - 1], "23:59:59.999"),
  };
}

/** Returns { start, end } ISO strings spanning the entire year. */
export function getYearRange(year) {
  return {
    start: `${year}-01-01T00:00:00.000Z`,
    end: `${year}-12-31T23:59:59.999Z`,
  };
}

/**
 * Classify how an event relates to a specific date.
 * Returns "start" | "end" | "ongoing" | "single" | null
 */
export function classifyEventDay(event, date, startField, endField) {
  const eventStart = event[startField] ? stripTime(new Date(event[startField])) : null;
  const eventEnd = event[endField] ? stripTime(new Date(event[endField])) : null;
  if (!eventStart) return null;

  const day = stripTime(date);
  const dayTime = day.getTime();

  // Single-day event (no end or same day)
  if (!eventEnd || eventStart.getTime() === eventEnd.getTime()) {
    return dayTime === eventStart.getTime() ? "single" : null;
  }

  if (dayTime === eventStart.getTime()) return "start";
  if (dayTime === eventEnd.getTime()) return "end";
  if (dayTime > eventStart.getTime() && dayTime < eventEnd.getTime()) return "ongoing";
  return null;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function isInMonth(date, year, month) {
  return date.getFullYear() === year && date.getMonth() === month;
}

/** Format a short time string like "9 AM" from a date string. */
export function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m > 0 ? `${h12}:${String(m).padStart(2, "0")} ${ampm}` : `${h12} ${ampm}`;
}

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toISODateTime(d, time) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T${time}Z`;
}

/** Format "YYYY-MM-DD" key for the dayMap. */
export function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
