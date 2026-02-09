import { Button } from "react-aria-components";

const LIMIT_OPTIONS = [10, 25, 50, 100];

export default function Pagination({ page, totalPages, limit, onPageChange, onLimitChange }) {
  if (totalPages <= 1 && limit === 25) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <Button
          isDisabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
          className="shadow-2xs focus:outline-hidden inline-flex items-center gap-x-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          Prev
        </Button>

        <span className="px-2 text-sm text-gray-600 dark:text-neutral-400">
          Page {page} of {totalPages || 1}
        </span>

        <Button
          isDisabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
          className="shadow-2xs focus:outline-hidden inline-flex items-center gap-x-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </Button>
      </div>

      {/* Per-page selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="page-limit" className="text-sm text-gray-600 dark:text-neutral-400">
          Per page
        </label>
        <select
          id="page-limit"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-1 -outline-offset-1 outline-gray-300 hover:border-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-neutral-300"
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
