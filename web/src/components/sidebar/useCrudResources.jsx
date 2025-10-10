import { useEffect, useState } from "react";

export function useCrudResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/meta/resources.json");
        if (!res.ok)
          throw new Error(`[web Sidebar useCrud] ⚠️ Failed: ${res.status}`);
        const json = await res.json();
        setResources((json || []).filter((r) => r.enabled !== false));
      } catch (e) {
        setError(e.message || "[web Sidebar useCrud] ❌ Error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { resources, loading, error };
}
