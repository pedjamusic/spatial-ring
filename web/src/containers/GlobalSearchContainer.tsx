import { useEffect, useMemo, useState } from "react";
import { GlobalSearch, SearchResult } from "@/components/search/GlobalSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function GlobalSearchContainer() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!debounced) {
        setResults([]);
        return;
      }
      // Fetch from all models; replace with your API calls
      // Example pseudo-requests:
      const [assets, categories, warehouses] = await Promise.all([
        fetch(`/api/assets?q=${encodeURIComponent(debounced)}`).then((r) =>
          r.json(),
        ),
        fetch(`/api/categories?q=${encodeURIComponent(debounced)}`).then((r) =>
          r.json(),
        ),
        fetch(`/api/warehouses?q=${encodeURIComponent(debounced)}`).then((r) =>
          r.json(),
        ),
      ]);
      const merged: SearchResult[] = [
        ...assets.map((a: any) => ({
          id: `asset-${a.id}`,
          label: a.name ?? a.sku,
          model: "Asset" as const,
          href: `/assets/${a.id}`,
        })),
        ...categories.map((c: any) => ({
          id: `cat-${c.id}`,
          label: c.name,
          model: "Category" as const,
          href: `/categories/${c.id}`,
        })),
        ...warehouses.map((w: any) => ({
          id: `wh-${w.id}`,
          label: w.name,
          model: "Warehouse" as const,
          href: `/warehouses/${w.id}`,
        })),
      ];
      if (active) setResults(merged);
    }
    run();
    return () => {
      active = false;
    };
  }, [debounced]);

  const grouped = useMemo(() => {
    return results.reduce<Record<string, SearchResult[]>>(
      (acc, curr) => {
        (acc[curr.model] ||= []).push(curr);
        return acc;
      },
      { Asset: [], Category: [], Warehouse: [] },
    );
  }, [results]);

  return (
    <GlobalSearch
      query={query}
      onQueryChange={setQuery}
      onSubmit={() => {
        /* optionally navigate to first result */
      }}
      grouped={grouped}
    />
  );
}
