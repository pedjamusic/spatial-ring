import { useState, useRef, useEffect, useCallback } from "react";

export default function SearchInput({ value = "", onChange, placeholder = "Search..." }) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync from parent when value is cleared externally
  useEffect(() => {
    if (value === "" && local !== "") setLocal("");
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const debounceEmit = useCallback(
    (val) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(val), 300);
    },
    [onChange],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocal(val);
    debounceEmit(val);
  };

  const handleClear = () => {
    setLocal("");
    clearTimeout(timerRef.current);
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Search icon */}
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center ps-3 text-gray-400">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="not-dark:shadow-sm w-full rounded-xl border border-gray-300 bg-white py-2 pe-8 ps-10 text-base text-gray-900 ring-0 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 hover:border-gray-400 hover:outline-gray-400 focus:border-blue-600 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-white dark:outline-neutral-700/50 dark:hover:border-neutral-600 dark:hover:outline-neutral-600 dark:focus:border-blue-600 dark:focus:outline-blue-600"
      />

      {/* Clear button */}
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 my-auto me-2 flex size-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-neutral-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
