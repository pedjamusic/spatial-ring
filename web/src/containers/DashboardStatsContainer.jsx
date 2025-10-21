import { useMemo } from "react";
import StatGrid from "@/components/cards/StatGrid";
import { useCrudResources } from "@/components/sidebar/useCrudResources";

/**
 * Container: resolves CRUD paths from resources, formats four stat cards, and passes them to StatGrid.
 * Provide totals via props to keep data-fetching flexible; wire real API calls where you gather metrics.
 */
export default function DashboardStatsContainer({
  totals = { assetsUnique: 0, categories: 0, warehouses: 0, quantity: 0 },
  icons = {},
}) {
  const { resources } = useCrudResources();

  // Find a resource path by matching common identifiers (path/title/resourceName/modelName)
  const findPath = (candidates) => {
    const lower = (v) => String(v || "").toLowerCase();
    for (const r of resources) {
      const hay = [r.path, r.title, r.resourceName, r.modelName].map(lower);
      if (candidates.some((c) => hay.some((h) => h.includes(lower(c))))) {
        return `/admin/${r.path}`;
      }
    }
    return "/admin"; // fallback
  };

  // Guess paths for common resources; adjust candidates to your meta/resources.json entries.
  const assetsPath = findPath(["assets", "asset"]);
  const categoriesPath = findPath([
    "asset-categories",
    "categories",
    "category",
  ]);
  const warehousesPath = findPath(["warehouses", "warehouse"]);
  // Route for quantity often points to the primary inventory list; adjust as needed (e.g., “assets”).
  const quantityPath = assetsPath;

  const stats = useMemo(
    () => [
      {
        label: "Total Assets (unique)",
        value: totals.assetsUnique,
        to: assetsPath,
        icon: icons.assets,
      },
      {
        label: "Total Categories",
        value: totals.categories,
        to: categoriesPath,
        icon: icons.categories,
      },
      {
        label: "Total Warehouses",
        value: totals.warehouses,
        to: warehousesPath,
        icon: icons.warehouses,
      },
      {
        label: "Total Quantity",
        value: totals.quantity,
        to: quantityPath,
        icon: icons.quantity,
      },
    ],
    [totals, assetsPath, categoriesPath, warehousesPath, quantityPath, icons],
  );

  return <StatGrid stats={stats} />;
}
