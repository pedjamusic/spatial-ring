import GenericCrud from "./GenericCrud";

export default function EventLocations() {
  const uiConfig = {
    // Optional: customize fields
    // kind: { label: 'Location Type' },
    // createdAt: { hidden: true }
    notes: { widget: "textarea" },
  };
  return (
    <GenericCrud
      modelName="EventLocation"
      resourceName="eventLocations"
      uiConfig={uiConfig}
    />
  );
}
