import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ModelTable from "../components/ModelTable";
import ColumnSettings from "../components/ColumnSettings";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import { PageHeader } from "../components/layout/PageHeader";
import { H1 } from "../components/typography/H1";
import LoadingSpinner from "../components/LoadingSpinner";
import ViewToggle from "../components/calendar/ViewToggle";
import CalendarNavigation from "../components/calendar/CalendarNavigation";
import CalendarMonthView from "../components/calendar/CalendarMonthView";
import CalendarYearView from "../components/calendar/CalendarYearView";
import useCalendarEvents from "../components/calendar/useCalendarEvents";
import { resource } from "../lib/api";
import { toast } from "../lib/toast";

const STORAGE_KEY_PREFIX = "uiConfig_";
const deepMerge = (a = {}, b = {}) =>
  Object.fromEntries(
    Object.keys({ ...a, ...b }).map((k) => {
      const aVal = a[k];
      const bVal = b[k];
      if (
        aVal && bVal &&
        typeof aVal === "object" && typeof bVal === "object" &&
        !Array.isArray(aVal) && !Array.isArray(bVal)
      ) {
        return [k, { ...aVal, ...bVal }];
      }
      return [k, bVal !== undefined ? bVal : aVal];
    }),
  );

export default function GenericListPage({
  modelName,
  resourceName,
  uiConfig: defaultUiConfig = {},
  titles = {},
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const singular = titles.singular || modelName;
  const plural = titles.plural || `${modelName}s`;

  const [meta, setMeta] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Calendar config from _viewConfig
  const calendarConfig = defaultUiConfig?._viewConfig?.calendar;
  const calendarEnabled = calendarConfig?.enabled;
  const viewStorageKey = `calendarView_${modelName}`;

  // View state from URL → localStorage → config default → "table"
  const view = calendarEnabled
    ? searchParams.get("view")
      || localStorage.getItem(viewStorageKey)
      || calendarConfig.defaultView
      || "table"
    : "table";
  const isCalendarView = view === "month" || view === "year";

  // Calendar date from URL (defaults to current month)
  const now = new Date();
  const calYear = Number(searchParams.get("year")) || now.getFullYear();
  const calMonth = Number(searchParams.get("month"))
    ? Number(searchParams.get("month")) - 1 // URL is 1-based, JS is 0-based
    : now.getMonth();

  // Pagination state — synced with URL search params
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 25;
  const search = searchParams.get("search") || "";
  const [totalPages, setTotalPages] = useState(0);

  // uiConfig state + localStorage
  const storageKey = `${STORAGE_KEY_PREFIX}${modelName}`;
  const [uiConfig, setUiConfig] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return deepMerge(defaultUiConfig, stored);
    } catch {
      return defaultUiConfig;
    }
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      setUiConfig(deepMerge(defaultUiConfig, stored));
    } catch {
      setUiConfig(defaultUiConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, JSON.stringify(defaultUiConfig)]);

  const handleToggleColumnPref = (fieldName, updates) => {
    setUiConfig((prev) => {
      const next = { ...prev, [fieldName]: { ...(prev[fieldName] || {}), ...updates } };
      const currentStored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const nextStored = { ...currentStored, [fieldName]: { ...(currentStored[fieldName] || {}), ...updates } };
      localStorage.setItem(storageKey, JSON.stringify(nextStored));
      return next;
    });
  };

  const handleResetPrefs = () => {
    localStorage.removeItem(storageKey);
    setUiConfig(defaultUiConfig);
  };

  const api = useMemo(() => resource(resourceName), [resourceName]);

  // Calendar events hook (only fetches when in calendar view)
  const { dayMap, loading: calLoading } = useCalendarEvents({
    resourceName,
    dateStartField: calendarConfig?.dateStartField || "startsAt",
    dateEndField: calendarConfig?.dateEndField || "endsAt",
    view: isCalendarView ? view : null,
    year: calYear,
    month: calMonth,
  });

  const loadData = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      // Load metadata
      const metaResponse = await fetch(`/api/meta/models/${modelName}`, { signal });
      if (!metaResponse.ok) throw new Error(`Meta fetch failed: ${metaResponse.status}`);
      const metaData = await metaResponse.json();
      setMeta(metaData);

      // Load paginated data (only for table view)
      if (!isCalendarView) {
        const res = await api.list({ page, limit, search: search || undefined }, { signal });
        setData(res.data || []);
        setTotalPages(res.meta?.totalPages || 0);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [modelName, api, page, limit, search, isCalendarView]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  // View switching — persist to localStorage
  const handleViewChange = useCallback((newView) => {
    localStorage.setItem(viewStorageKey, newView);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("view", newView);
      // When switching to calendar, set year/month if not present
      if (newView === "month" || newView === "year") {
        if (!next.has("year")) next.set("year", String(now.getFullYear()));
        if (newView === "month" && !next.has("month")) {
          next.set("month", String(now.getMonth() + 1));
        }
        // Remove table-only params
        next.delete("page");
        next.delete("limit");
        next.delete("search");
      } else {
        // Switching to table — remove calendar params
        next.delete("year");
        next.delete("month");
      }
      return next;
    });
  }, [setSearchParams, now]);

  const handleCalendarNavigate = useCallback((newYear, newMonth) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("year", String(newYear));
      next.set("month", String(newMonth + 1)); // URL is 1-based
      return next;
    });
  }, [setSearchParams]);

  const handleMonthClick = useCallback((monthIndex) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("view", "month");
      next.set("month", String(monthIndex + 1));
      return next;
    });
  }, [setSearchParams]);

  // Reset to page 1 when search changes
  const handleSearchChange = useCallback((val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("search", val); else next.delete("search");
      next.set("page", "1");
      return next;
    });
  }, [setSearchParams]);

  const handleLimitChange = useCallback((val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("limit", String(val));
      next.set("page", "1");
      return next;
    });
  }, [setSearchParams]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.remove(id);
      toast.info(`${singular} deleted.`);
      await loadData();
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to delete ${singular}: ${err.message}`);
    }
  };

  if (loading && !meta) return <LoadingSpinner />;
  if (!meta) return <div>Model not found</div>;

  const labelField = calendarConfig?.labelField || "name";
  const dateStartField = calendarConfig?.dateStartField || "startsAt";

  return (
    <div className="grid gap-y-4">
      <PageHeader />

      {error && (
        <div className="border border-red-300 bg-red-200 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Title + ViewToggle + Create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <H1>{plural}</H1>
          {calendarEnabled && (
            <ViewToggle value={view} onChange={handleViewChange} />
          )}
        </div>
        <Link
          to="new"
          className="shadow-2xs focus:outline-hidden hidden items-center gap-x-2 rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:bg-blue-800 sm:inline-flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Create {singular}
        </Link>
      </div>

      {/* Mobile fixed bottom Create button */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center sm:hidden">
        <Link
          to="new"
          className="shadow-lg focus:outline-hidden inline-flex items-center gap-x-2 rounded-full border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 focus:bg-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Create {singular}
        </Link>
      </div>

      {/* Card */}
      <div className="not-dark:shadow rounded-xl border border-gray-300 bg-white dark:border-neutral-700/50 dark:bg-neutral-800/50">
        {isCalendarView ? (
          <>
            <CalendarNavigation
              view={view}
              year={calYear}
              month={calMonth}
              onNavigate={handleCalendarNavigate}
            />
            {calLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : view === "month" ? (
              <CalendarMonthView
                year={calYear}
                month={calMonth}
                dayMap={dayMap}
                labelField={labelField}
                dateStartField={dateStartField}
              />
            ) : (
              <CalendarYearView
                year={calYear}
                dayMap={dayMap}
                labelField={labelField}
                dateStartField={dateStartField}
                onMonthClick={handleMonthClick}
              />
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-300 px-6 py-4 dark:border-neutral-700/50">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={`Search ${plural.toLowerCase()}...`}
              />
              <ColumnSettings
                meta={meta}
                config={uiConfig}
                onToggle={handleToggleColumnPref}
                onReset={handleResetPrefs}
              />
            </div>
            <ModelTable
              meta={meta}
              data={data}
              onEdit={(row) => navigate(`${row.id}/edit`)}
              onDelete={handleDelete}
              uiConfig={uiConfig}
              modelName={modelName}
            />
          </>
        )}
      </div>

      {/* Pagination — table view only */}
      {!isCalendarView && (
        <Pagination
          page={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={(val) => setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(val));
            return next;
          })}
          onLimitChange={handleLimitChange}
        />
      )}
    </div>
  );
}
