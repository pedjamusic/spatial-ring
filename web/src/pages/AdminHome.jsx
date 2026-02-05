import { useEffect, useState } from "react";
import { resource } from "@/lib/api";

import { H1 } from "@/components/typography/H1";
import { H2 } from "@/components/typography/H2";

import DashboardStatsContainer from "@/containers/dashboard/Stats";
import { UpcomingEventsContainer } from "@/containers/dashboard/UpcomingEvents";
import { GlobalSearchContainer } from "@/containers/search/GlobalSearch";

export default function AdminHome() {
  const [totals, setTotals] = useState({
    assetsUnique: 0,
    categories: 0,
    warehouses: 0,
    quantity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);

        // Fetch all resources in parallel using your existing API client
        const [assets, categories, warehouses] = await Promise.all([
          resource("assets").list(),
          resource("assetCategories").list(),
          resource("warehouses").list(),
        ]);

        if (active) {
          // Calculate unique asset count (by ID)
          const uniqueAssetIds = new Set(assets.map((a) => a.id));

          // Calculate total quantity across all assets
          const totalQty = assets.reduce((sum, asset) => {
            return sum + (Number(asset.quantity) || 0);
          }, 0);

          setTotals({
            assetsUnique: uniqueAssetIds.size,
            categories: categories.length,
            warehouses: warehouses.length,
            quantity: totalQty,
          });
        }
      } catch (err) {
        if (active) {
          console.error("Failed to fetch dashboard stats:", err);
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <H1>Dashboard</H1>

      <div className="space-y-6">
        <H2>Overview</H2>
        <DashboardStatsContainer totals={totals} />
        <div className="mt-8">
          <H2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
            Upcoming Events
          </H2>
          <UpcomingEventsContainer />
        </div>
        {/* Global Search */}
        <div className="mt-8">
          <H2>Global search</H2>
          <GlobalSearchContainer />
        </div>
      </div>
    </>
  );
}
