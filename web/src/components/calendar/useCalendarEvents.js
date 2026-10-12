import { useEffect, useState, useMemo } from "react";
import { resource } from "../../lib/api";
import {
  getMonthRange,
  getYearRange,
  classifyEventDay,
  dayKey,
} from "./calendarUtils";

/**
 * Fetches events for the visible calendar range and builds a
 * Map<"YYYY-MM-DD", Array<{ event, classification }>> ("dayMap").
 */
export default function useCalendarEvents({
  resourceName,
  dateStartField,
  dateEndField,
  view,
  year,
  month,
}) {
  const [result, setResult] = useState(null);
  const requestContext = JSON.stringify({ resourceName, dateStartField, dateEndField, view, year, month });

  if (result?.context !== requestContext) {
    setResult({ context: requestContext, dayMap: null });
  }

  const api = useMemo(() => resource(resourceName), [resourceName]);

  useEffect(() => {
    if (!view) return;
    const controller = new AbortController();
    const { signal } = controller;
    const context = JSON.parse(requestContext);
    (async () => {
      try {
        const range = context.view === "year"
          ? getYearRange(context.year) : getMonthRange(context.year, context.month);
        const res = await api.list(
          { rangeStart: range.start, rangeEnd: range.end },
          { signal },
        );
        const events = res.data || [];

        // Build dayMap: iterate each event, walk its date span, classify each day
        const map = new Map();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const event of events) {
          const start = event[context.dateStartField]
            ? new Date(event[context.dateStartField])
            : null;
          const end = event[context.dateEndField]
            ? new Date(event[context.dateEndField])
            : null;
          if (!start) continue;

          const rangeEndDate = end || start;
          const effectiveEnd = new Date(
            rangeEndDate.getFullYear(),
            rangeEndDate.getMonth(),
            rangeEndDate.getDate(),
          );
          const isPast = effectiveEnd < today;

          const cursor = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
          );

          while (cursor <= effectiveEnd) {
            const key = dayKey(cursor);
            const classification = classifyEventDay(
              event,
              cursor,
              context.dateStartField,
              context.dateEndField,
            );
            if (classification) {
              if (!map.has(key)) map.set(key, []);
              map.get(key).push({ event, classification, isPast });
            }
            cursor.setDate(cursor.getDate() + 1);
          }
        }

        if (!signal.aborted) setResult({ context: requestContext, dayMap: map });
      } catch (err) {
        if (signal.aborted || err.name === "AbortError") return;
        setResult({ context: requestContext, dayMap: new Map() });
      }
    })();
    return () => controller.abort();
  }, [api, requestContext, view]);

  const isCurrent = result?.context === requestContext && result.dayMap !== null;
  return {
    dayMap: view && isCurrent ? result.dayMap : new Map(),
    loading: Boolean(view) && !isCurrent,
  };
}
