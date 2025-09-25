import GenericCrud from "./GenericCrud";

export default function Warehouses() {
  const uiConfig = {
    // Optional: customize fields
    // kind: { label: 'Warehouse Type' },
    // createdAt: { hidden: true }
    // notes: { widget: "textarea" },
  };
  return (
    <GenericCrud
      modelName="Warehouse"
      resourceName="warehouses"
      uiConfig={uiConfig}
    />
  );
}
