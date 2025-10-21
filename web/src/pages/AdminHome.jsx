import { useEffect, useState } from "react";
import DashboardStatsContainer from "@/containers/DashboardStatsContainer";

/**
 * Page: keep it thin—fetch or compute totals here (or in a parent loader) and pass to the container.
 * Replace the mocked totals with real API calls.
 */

export default function AdminHome() {
  const [totals, setTotals] = useState({
    assetsUnique: 0,
    categories: 0,
    warehouses: 0,
    quantity: 0,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // TODO: Replace with your real endpoints/aggregations
        // Example sketch:
        // const [assets, cats, whs] = await Promise.all([
        //   fetch("/api/assets?fields=id,qty").then((r) => r.json()),
        //   fetch("/api/categories?fields=id").then((r) => r.json()),
        //   fetch("/api/warehouses?fields=id").then((r) => r.json()),
        // ]);
        // const uniqueAssetIds = new Set(assets.map(a => a.id)).size;
        // const totalQty = assets.reduce((sum, a) => sum + (a.qty || 0), 0);
        // if (active) setTotals({ assetsUnique: uniqueAssetIds, categories: cats.length, warehouses: whs.length, quantity: totalQty });

        // Demo values:
        if (active) {
          setTotals({
            assetsUnique: 128,
            categories: 12,
            warehouses: 4,
            quantity: 3275,
          });
        }
      } catch {
        // handle errors / show toast
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashboardStatsContainer totals={totals} />
      {/* Place your global search component below this line */}
    </div>
  );
}
