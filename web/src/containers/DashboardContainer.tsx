import { useMemo } from "react";
import { StatGrid } from "@/components/cards/StatGrid";
import { GlobalSearchContainer } from "./GlobalSearchContainer";
import type { Item, Category, Warehouse } from "@/types/inventory";

type Props = {
  items: Item[];
  categories: Category[];
  warehouses: Warehouse[];
};

export function DashboardContainer({ items, categories, warehouses }: Props) {
  const { totalAssetsUnique, totalQuantity } = useMemo(() => {
    const uniqueAssetIds = new Set(items.map((i) => i.id));
    const sumQty = items.reduce((acc, i) => acc + (i.qty ?? 0), 0);
    return { totalAssetsUnique: uniqueAssetIds.size, totalQuantity: sumQty };
  }, [items]);

  return (
    <div className="space-y-6">
      <StatGrid
        totalAssetsUnique={totalAssetsUnique}
        totalCategories={categories.length}
        totalWarehouses={warehouses.length}
        totalQuantity={totalQuantity}
      />
      <GlobalSearchContainer />
    </div>
  );
}
