import EventCard from "./EventCard";

export default function EventCardGrid({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center text-gray-500 dark:border-neutral-700 dark:bg-neutral-800/50">
        <p>No upcoming events scheduled</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} to={`/admin/events/${event.id}/edit`} />
      ))}
    </div>
  );
}
