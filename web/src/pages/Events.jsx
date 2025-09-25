import GenericCrud from "./GenericCrud";

export default function Events() {
  const uiConfig = {
    // Optional: customize fields
    columnOrder: ["name", "date", "location", "status"],
    maxColumns: 2,
    location: {
      label: "Event Location",
      path: "location.name", // Display the 'name' field from the related Location
    },
    locationId: { hidden: true }, // Hide the raw CUID field
    id: { hidden: true }, // Hide ID field
    notes: { widget: "textarea", hidden: true }, // Use textarea for notes, but hide it in the table/list view
    createdAt: { hidden: true },
    updatedAt: { hidden: true },
  };
  return (
    <GenericCrud modelName="Event" resourceName="events" uiConfig={uiConfig} />
  );
}
