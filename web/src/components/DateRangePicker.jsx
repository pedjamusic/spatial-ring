import { useRef, useEffect, useCallback } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "../styles/flatpickr-theme.css";
import { Calendar } from "lucide-react";
import { inputClasses } from "../lib/formStyles";

/**
 * Combined date-range + optional time picker powered by flatpickr.
 * Manages two fields (start & end) via a single calendar widget.
 * Has Cancel / Apply buttons — selection is only committed on Apply.
 */
export default function DateRangePicker({
  id = "date-range",
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  onBlur,
  enableTime = false,
  required = false,
  label = "Date Range",
  error = null,
  touched = false,
}) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);
  // Snapshot of dates when the picker opens — used by Cancel to revert
  const snapshotRef = useRef({ start: "", end: "" });
  // Pending selection (not yet committed)
  const pendingRef = useRef({ start: "", end: "" });

  const commitDates = useCallback(
    (start, end) => {
      onChangeStart(start);
      onChangeEnd(end);
    },
    [onChangeStart, onChangeEnd],
  );

  useEffect(() => {
    if (!inputRef.current) return;

    const defaultDates = [];
    if (startValue) defaultDates.push(new Date(startValue));
    if (endValue) defaultDates.push(new Date(endValue));

    pendingRef.current = { start: startValue || "", end: endValue || "" };

    const fp = flatpickr(inputRef.current, {
      mode: "range",
      enableTime,
      dateFormat: enableTime ? "M j, Y H:i" : "M j, Y",
      defaultDate: defaultDates,
      showMonths: window.innerWidth >= 640 ? 2 : 1,
      closeOnSelect: false,
      static: true,
      monthSelectorType: "static",
      onChange(selectedDates) {
        pendingRef.current = {
          start: selectedDates[0] ? selectedDates[0].toISOString() : "",
          end: selectedDates[1] ? selectedDates[1].toISOString() : "",
        };
      },
      onOpen() {
        snapshotRef.current = {
          start: startValue || "",
          end: endValue || "",
        };
      },
      onReady(_dates, _str, instance) {
        // Inject Cancel / Apply footer
        const footer = document.createElement("div");
        footer.className = "flatpickr-footer";

        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "fp-cancel";
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", () => {
          // Revert to snapshot
          const { start, end } = snapshotRef.current;
          const dates = [];
          if (start) dates.push(new Date(start));
          if (end) dates.push(new Date(end));
          instance.setDate(dates, false);
          pendingRef.current = { start, end };
          commitDates(start, end);
          instance.close();
        });

        const applyBtn = document.createElement("button");
        applyBtn.type = "button";
        applyBtn.className = "fp-apply";
        applyBtn.textContent = "Apply";
        applyBtn.addEventListener("click", () => {
          commitDates(pendingRef.current.start, pendingRef.current.end);
          instance.close();
        });

        const btnGroup = document.createElement("div");
        btnGroup.className = "fp-btn-group";
        btnGroup.appendChild(cancelBtn);
        btnGroup.appendChild(applyBtn);
        footer.appendChild(btnGroup);
        instance.calendarContainer.appendChild(footer);
      },
    });

    fpRef.current = fp;

    return () => {
      fp.destroy();
    };
  }, [enableTime]); // only re-init when enableTime changes

  // Sync external value changes into flatpickr without re-creating
  useEffect(() => {
    if (!fpRef.current) return;
    const dates = [];
    if (startValue) dates.push(new Date(startValue));
    if (endValue) dates.push(new Date(endValue));

    const current = fpRef.current.selectedDates;
    const same =
      current.length === dates.length &&
      current.every((d, i) => d.getTime() === dates[i].getTime());

    if (!same) {
      fpRef.current.setDate(dates, false);
      pendingRef.current = { start: startValue || "", end: endValue || "" };
    }
  }, [startValue, endValue]);

  // Build display text
  const formatDisplay = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const displayText = startValue
    ? endValue
      ? `${formatDisplay(startValue)}  —  ${formatDisplay(endValue)}`
      : formatDisplay(startValue)
    : "Select dates…";
  const showError = touched && error;
  const errorId = `${id}-error`;

  return (
    <div className="col-span-full sm:col-span-2">
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <div className="flatpickr-wrapper relative mt-1">
        <input ref={inputRef} type="text" className="sr-only" tabIndex={-1} />

        <button
          id={id}
          type="button"
          onClick={() => fpRef.current?.open()}
          onBlur={onBlur}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
          className={`${inputClasses(showError)} flex items-center gap-2 text-left`}
        >
          <Calendar className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
          <span className={startValue ? "" : "text-gray-400 dark:text-gray-500"}>
            {displayText}
          </span>
        </button>
      </div>
      {showError && (
        <p id={errorId} className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
