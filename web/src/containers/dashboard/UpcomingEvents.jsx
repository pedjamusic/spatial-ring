import { useEffect, useState } from "react";
import { resource } from "@/lib/api";
import EventCardGrid from "@/components/cards/EventCardGrid";

export function UpcomingEventsContainer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const allEvents = await resource("events").list();

        if (active) {
          const now = new Date();
          const upcoming = allEvents
            .filter((e) => {
              // Include events that haven't started yet OR are currently ongoing
              const startsAt = e.startsAt ? new Date(e.startsAt) : null;
              const endsAt = e.endsAt ? new Date(e.endsAt) : null;

              // Future event: startsAt is in the future
              if (startsAt && startsAt >= now) return true;

              // Ongoing event: startsAt is in the past but endsAt is in the future
              if (startsAt && startsAt < now && endsAt && endsAt >= now)
                return true;

              return false;
            })
            .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
            .slice(0, 4);

          setEvents(upcoming);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to fetch upcoming events:", err);
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-gray-500">Loading upcoming events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Error loading events</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return <EventCardGrid events={events} />;
}
