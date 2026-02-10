import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarNavigation({ view, year, month, onNavigate }) {
  const label =
    view === "year" ? String(year) : `${MONTH_NAMES[month]} ${year}`;

  const goPrev = () => {
    if (view === "year") {
      onNavigate(year - 1, month);
    } else {
      const d = new Date(year, month - 1, 1);
      onNavigate(d.getFullYear(), d.getMonth());
    }
  };

  const goNext = () => {
    if (view === "year") {
      onNavigate(year + 1, month);
    } else {
      const d = new Date(year, month + 1, 1);
      onNavigate(d.getFullYear(), d.getMonth());
    }
  };

  const goToday = () => {
    const now = new Date();
    onNavigate(now.getFullYear(), now.getMonth());
  };

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-x-3">
        <button
          type="button"
          onClick={goPrev}
          className="inline-flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
          {label}
        </h2>
        <button
          type="button"
          onClick={goNext}
          className="inline-flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={goToday}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        Today
      </button>
    </div>
  );
}
