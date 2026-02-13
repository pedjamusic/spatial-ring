export function getFieldValueKey(field) {
  if (field?.kind === "object" && !field?.isList) {
    return field.name.endsWith("Id") ? field.name : `${field.name}Id`;
  }
  return field?.name;
}
