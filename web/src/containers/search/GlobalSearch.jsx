import { useEffect, useMemo, useState } from "react";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { resource } from "@/lib/api";

const MIN_SEARCH_LENGTH = 3;
const RESULTS_PER_CATEGORY = 5;

export function GlobalSearchContainer() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  const [allData, setAllData] = useState({
    assets: [],
    categories: [],
    warehouses: [],
    events: [],
    locations: [],
  });
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchAllData() {
      try {
        setLoading(true);
        // Note: resource names here must match your API endpoints (usually camelCase)
        const [assetsRes, categoriesRes, warehousesRes, eventsRes, locationsRes] =
          await Promise.all([
            resource("assets").list(),
            resource("assetCategories").list(),
            resource("warehouses").list(),
            resource("events").list(),
            resource("eventLocations").list(),
          ]);

        if (active) {
          setAllData({
            assets: assetsRes.data || [],
            categories: categoriesRes.data || [],
            warehouses: warehousesRes.data || [],
            events: eventsRes.data || [],
            locations: locationsRes.data || [],
          });
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Failed to fetch search ", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchAllData();

    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < MIN_SEARCH_LENGTH) {
      return [];
    }

    const searchLower = debouncedQuery.toLowerCase();

    const matches = (text) => {
      return text?.toLowerCase().includes(searchLower) ?? false;
    };

    const matchedAssets = allData.assets
      .filter(
        (a) => matches(a.name) || matches(a.sku) || matches(a.description),
      )
      .slice(0, RESULTS_PER_CATEGORY)
      .map((a) => ({
        id: `asset-${a.id}`,
        label: a.name || a.sku || `Asset #${a.id}`,
        model: "Asset",
        href: `/admin/assets`, // Single word: correct
      }));

    const matchedCategories = allData.categories
      .filter((c) => matches(c.name))
      .slice(0, RESULTS_PER_CATEGORY)
      .map((c) => ({
        id: `category-${c.id}`,
        label: c.name || `Category #${c.id}`,
        model: "Category",
        href: `/admin/assetCategories`, // FIXED: camelCase to match resources.json
      }));

    const matchedWarehouses = allData.warehouses
      .filter((w) => matches(w.name) || matches(w.location))
      .slice(0, RESULTS_PER_CATEGORY)
      .map((w) => ({
        id: `warehouse-${w.id}`,
        label: w.name || `Warehouse #${w.id}`,
        model: "Warehouse",
        href: `/admin/warehouses`,
      }));

    const matchedEvents = allData.events
      .filter((e) => matches(e.name) || matches(e.description))
      .slice(0, RESULTS_PER_CATEGORY)
      .map((e) => ({
        id: `event-${e.id}`,
        label: e.name || `Event #${e.id}`,
        model: "Event",
        href: `/admin/events`,
      }));

    const matchedLocations = allData.locations
      .filter((l) => matches(l.name) || matches(l.address))
      .slice(0, RESULTS_PER_CATEGORY)
      .map((l) => ({
        id: `location-${l.id}`,
        label: l.name || `Location #${l.id}`,
        model: "Location",
        href: `/admin/eventLocations`, // FIXED: camelCase to match resources.json
      }));

    return [
      ...matchedAssets,
      ...matchedCategories,
      ...matchedWarehouses,
      ...matchedEvents,
      ...matchedLocations,
    ];
  }, [debouncedQuery, allData]);

  const grouped = useMemo(() => {
    return results.reduce(
      (acc, curr) => {
        (acc[curr.model] ||= []).push(curr);
        return acc;
      },
      { Asset: [], Category: [], Warehouse: [], Event: [], Location: [] },
    );
  }, [results]);

  return (
    <GlobalSearch
      query={query}
      onQueryChange={setQuery}
      grouped={grouped}
      loading={loading && !dataLoaded}
      minSearchLength={MIN_SEARCH_LENGTH}
    />
  );
}
