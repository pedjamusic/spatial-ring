import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

export function GlobalSearch({
  query,
  onQueryChange,
  grouped,
  loading = false,
  minSearchLength = 3,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const hasResults = Object.values(grouped).some((arr) => arr.length > 0);
  const showHint = query.length > 0 && query.length < minSearchLength;

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length >= minSearchLength) setIsOpen(true);
  };

  const handleChange = (e) => {
    onQueryChange(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (e, href) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Close the UI immediately
    setIsOpen(false);

    // 2. Schedule navigation for the next tick.
    // This allows the UI to settle and prevents the "concurrent rendering" crash
    // caused by unmounting components while events are still bubbling.
    setTimeout(() => {
      onQueryChange(""); // Clear the query
      navigate(href); // Perform the navigation
    }, 10);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      {/* Simple HTML Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-gray-300 bg-white py-2 pe-8 ps-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Search…"
          aria-label="Global search"
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center ps-3 text-gray-400">
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        {query && (
          <button
            onClick={() => {
              onQueryChange("");
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 my-auto me-2 flex size-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 focus:outline-none"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
        {isFocused ? (
          <kbd className={`pointer-events-none absolute inset-y-0 right-0 my-auto ${query ? "me-9" : "me-2"} hidden h-5 items-center rounded border border-gray-300 bg-gray-100 px-1.5 font-sans text-xs text-gray-400 pointer-fine:flex`}>
            ESC
          </kbd>
        ) : !query && (
          <kbd className="pointer-events-none absolute inset-y-0 right-0 my-auto me-2 hidden h-5 items-center rounded border border-gray-300 bg-gray-100 px-1.5 font-sans text-xs text-gray-400 pointer-fine:sm:flex">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        )}
      </div>

      {/* Backdrop + Results Dropdown */}
      {isOpen && query.length >= minSearchLength && (
        <>
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onMouseDown={() => setIsOpen(false)}
        />
        <div className="fixed inset-x-4 z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:w-full">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(grouped).map(([groupName, items]) =>
                items.length > 0 ? (
                  <div key={groupName} className="py-2">
                    <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {groupName}
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onMouseDown={(e) => handleResultClick(e, item.href)}
                        className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 hover:bg-gray-100"
                      >
                        <span className="text-sm text-gray-900">
                          {item.label}
                        </span>
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium uppercase text-gray-600">
                          {item.model}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
        </>
      )}

      {/* Hint */}
      {showHint && (
        <div className="mt-2 text-xs text-gray-500">
          Type at least {minSearchLength} characters to search
        </div>
      )}
    </div>
  );
}
