import GenericCrud from "./GenericCrud";

export default function Assets() {
  const uiConfig = {
    category: {
      label: "Category",
      path: "category.name", // Display the 'name' field from the related Category
    },
    // restingLocationId: {
    //   label: "Location",
    //   widget: "relation",
    //   // You'll need to load location options here
    //   options: [],
    // },
    // notes: { widget: "textarea" },
  };
  return (
    <GenericCrud modelName="Asset" resourceName="assets" uiConfig={uiConfig} />
  );
}
