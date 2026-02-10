import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const CLASS_COLORS = {
  start: "bg-blue-600",
  single: "bg-blue-600",
  ongoing: "bg-blue-300",
  end: "bg-blue-200",
};

const CLASS_LABELS = {
  start: "Starts",
  single: "Event",
  ongoing: "Ongoing",
  end: "Ends",
};

export default function EventDayPopover({
  date,
  entries,
  triggerRect,
  labelField,
  onClose,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const style = {};
  if (triggerRect) {
    const popoverWidth = 280;
    let left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
    let top = triggerRect.bottom + 6;
    if (top + 300 > window.innerHeight) {
      top = triggerRect.top - 6 - 200;
    }
    style.position = "fixed";
    style.left = left;
    style.top = top;
    style.width = popoverWidth;
    style.zIndex = 50;
  }

  const formatted = date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={ref}
      style={style}
      className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
      role="dialog"
      aria-label={`Events on ${formatted}`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
          {formatted}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
        >
          <X size={14} />
        </button>
      </div>
      <ul className="max-h-60 divide-y divide-gray-100 overflow-y-auto dark:divide-neutral-700">
        {entries.map((entry) => (
            <li key={`${entry.event.id}-${entry.classification}`} className="px-4 py-2.5">
              <Link
                to={`${entry.event.id}/edit`}
                className="flex items-center gap-x-2.5 text-sm text-gray-700 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-400"
                onClick={onClose}
              >
                <span
                  className={`inline-block size-2 shrink-0 rounded-full ${CLASS_COLORS[entry.classification]}`}
                />
                <span className="truncate">{entry.event[labelField]}</span>
                <span className="ml-auto shrink-0 text-xs text-gray-400">
                  {CLASS_LABELS[entry.classification]}
                </span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
