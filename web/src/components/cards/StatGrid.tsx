import { StatCard } from "./StatCard";

type Item = { id: string; sku: string; qty: number };
type Category = { id: string; name: string };
type Warehouse = { id: string; name: string };

type StatGridProps = {
  totalAssetsUnique: number;
  totalCategories: number;
  totalWarehouses: number;
  totalQuantity: number;
};

export function StatGrid(props: StatGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Assets (unique)"
        value={props.totalAssetsUnique}
        to="/assets"
      />
      <StatCard
        label="Total Categories"
        value={props.totalCategories}
        to="/assetCategories"
      />
      <StatCard
        label="Total Warehouses"
        value={props.totalWarehouses}
        to="/warehouses"
      />
      <StatCard label="Total Quantity" value={props.totalQuantity} to="#" />
    </div>
  );
}
