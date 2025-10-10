import { TextArea } from "react-aria-components";
import GenericCrud from "./GenericCrud";

export default function Warehouses() {
  const uiConfig = {
    // Optional: customize fields
    // kind: { label: 'Warehouse Type' },
    // createdAt: { hidden: true }
    // notes: { widget: "textarea" },
    id: { hideInTable: true },
    createdAt: { hideInTable: true },
    notes: { hideInTable: true },
  };
  return (
    <GenericCrud
      modelName="Warehouse"
      resourceName="warehouses"
      uiConfig={uiConfig}
    />
  );
}
