import { useEffect, useState, useMemo, useCallback } from "react";
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
  const [dayMap, setDayMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  const api = useMemo(() => resource(resourceName), [resourceName]);

  const fetchEvents = useCallback(async (signal) => {
    if (!view) {
      setDayMap(new Map());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const range =
        view === "year" ? getYearRange(year) : getMonthRange(year, month);
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
        const start = event[dateStartField]
          ? new Date(event[dateStartField])
          : null;
        const end = event[dateEndField]
          ? new Date(event[dateEndField])
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
            dateStartField,
            dateEndField,
          );
          if (classification) {
            if (!map.has(key)) map.set(key, []);
            map.get(key).push({ event, classification, isPast });
          }
          cursor.setDate(cursor.getDate() + 1);
        }
      }

      setDayMap(map);
    } catch (err) {
      if (err.name === "AbortError") return;
      setDayMap(new Map());
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [api, dateStartField, dateEndField, view, year, month]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [fetchEvents]);

  return { dayMap, loading };
}
