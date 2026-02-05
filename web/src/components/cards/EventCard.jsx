import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

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

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const now = new Date();
    const eventDate = new Date(dateString);
    const days = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntil = getDaysUntil(event.startsAt);

  return (
    <Link
      tabIndex={1}
      to={to}
      className={[
        "not-dark:shadow block rounded-md border border-gray-300 bg-white outline-1 -outline-offset-1 outline-gray-300 hover:border-gray-400 hover:outline-gray-400 focus:outline-2 focus:outline-blue-600 dark:border-neutral-700/25 dark:bg-neutral-800/50 dark:text-white dark:outline-neutral-700/25 dark:hover:border-gray-700 dark:hover:outline-gray-700",
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

        {/* Days until badge */}
        {daysUntil !== null && daysUntil >= 0 && (
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {daysUntil === 0
              ? "Today"
              : daysUntil === 1
                ? "Tomorrow"
                : `In ${daysUntil} days`}
          </div>
        )}
      </div>
    </Link>
  );
}
