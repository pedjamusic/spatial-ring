import GenericCrud from "./GenericCrud";

export default function AssetsCrud() {
  const uiConfig = {
    restingLocationId: {
      label: "Location",
      widget: "relation",
      // You'll need to load location options here
      options: [],
    },
    notes: { widget: "textarea" },
  };
  return (
    <GenericCrud modelName="Asset" resourceName="assets" uiConfig={uiConfig} />
  );
}
