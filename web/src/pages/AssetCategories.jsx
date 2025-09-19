import GenericCrud from "./GenericCrud";

export default function AssetCategoriesCrud() {
  const uiConfig = {
    // Optional: customize if needed
  };

  return (
    <GenericCrud
      modelName="AssetCategory"
      resourceName="assetCategories"
      uiConfig={uiConfig}
    />
  );
}
