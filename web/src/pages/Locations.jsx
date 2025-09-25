import GenericCrud from "./GenericCrud";

export default function Locations() {
  const uiConfig = {
    // Optional: customize fields
    // kind: { label: 'Location Type' },
    // createdAt: { hidden: true }
    // notes: { widget: "textarea" },
  };
  return (
    <GenericCrud
      modelName="Location"
      resourceName="locations"
      uiConfig={uiConfig}
    />
  );
}
