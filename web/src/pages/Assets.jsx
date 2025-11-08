import GenericCrud from "./GenericCrud";

export default function Assets() {
  const uiConfig = {
    // Photo configuration
    // photoField: "photoUrl", // Enable photo column in table
    photoUrl: {
      widget: "photo", // Use photo upload widget in form
      hideInTable: true, // Don't show photoUrl as text column
      label: "Photo",
      hidden: false,
    },
    // Other field configurations
    category: {
      label: "Category",
      path: "category.name", // Display the 'name' field from the related Category
    },
    restingLocation: {
      label: "Location",
      path: "restingLocation.name",
    },
    make: {
      label: "Make/Brand",
    },
    // Column order (photo will be first, then these in order)
    columnOrder: [
      "name",
      "category",
      "make",
      "model",
      "status",
      "restingLocation",
    ],
    id: { hideInTable: true },
    // restingLocationId: {
    //   label: "Location",
    //   widget: "relation",
    //   // You'll need to load location options here
    //   options: [],
    // },
    notes: { widget: "textarea" },
  };
  return (
    <GenericCrud
      modelName="Asset"
      resourceName="assets"
      uiConfig={uiConfig}
      titles={{
        singular: "Asset",
        plural: "Assets",
      }}
    />
  );
}
