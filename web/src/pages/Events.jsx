import GenericCrud from "./GenericCrud";

export default function EventsCrud() {
  const uiConfig = {
    // Optional: customize fields
    // kind: { label: 'Location Type' },
    // createdAt: { hidden: true }
    notes: { widget: "textarea" },
  };
  return (
    <GenericCrud modelName="Event" resourceName="events" uiConfig={uiConfig} />
  );
}
