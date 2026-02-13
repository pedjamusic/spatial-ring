export function normalizeInputValue(inputType, rawValue) {
  if (inputType !== "number") {
    return rawValue;
  }

  if (rawValue === "") {
    return "";
  }

  const numberValue = Number(rawValue);
  return Number.isNaN(numberValue) ? "" : numberValue;
}
