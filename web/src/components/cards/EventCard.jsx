import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import Badge from "../ui/Badge";

export default function EventCard({ event, to, size = "md" }) {
  const sizeMap = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventStatus = () => {
    const now = new Date();
    const startsAt = event.startsAt ? new Date(event.startsAt) : null;
    const endsAt = event.endsAt ? new Date(event.endsAt) : null;

    if (!startsAt) return null;

    // Event is ongoing if it has started but not yet ended
    if (startsAt < now && endsAt && endsAt >= now) {
      return { type: "ongoing", variant: "green" };
    }

    // Event hasn't started yet - calculate days until
    if (startsAt >= now) {
      const days = Math.ceil((startsAt - now) / (1000 * 60 * 60 * 24));
      const variant = days <= 3 ? "red" : days <= 7 ? "yellow" : "blue";

      return {
        type: "upcoming",
        days,
        variant,
      };
    }

    return null;
  };

  const eventStatus = getEventStatus();

  return (
    <Link
      tabIndex={1}
      to={to}
      className={[
        "not-dark:shadow block rounded-xl border border-gray-300 bg-white outline-1 -outline-offset-1 outline-gray-300 hover:border-gray-400 hover:outline-gray-400 focus:outline-2 focus:outline-blue-600 dark:border-neutral-700/25 dark:bg-neutral-800/50 dark:text-white dark:outline-neutral-700/25 dark:hover:border-gray-700 dark:hover:outline-gray-700",
        sizeMap[size],
      ].join(" ")}
      aria-label={`Event: ${event.name}`}
    >
      <div className="space-y-3">
        {/* Event name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {event.name}
        </h3>

        {/* Date info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.startsAt)}</span>
        </div>

        {/* Location if available */}
        {event.location?.name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.location.name}</span>
          </div>
        )}

        {/* Event status badge */}
        {eventStatus && (
          <Badge variant={eventStatus.variant}>
            {eventStatus.type === "ongoing"
              ? "Ongoing"
              : eventStatus.days === 0
                ? "Today"
                : eventStatus.days === 1
                  ? "Tomorrow"
                  : `In ${eventStatus.days} days`}
          </Badge>
        )}
      </div>
    </Link>
  );
}
