// Normalizes strings like "warehouse", "Warehouse", "folder_tree", "folder-tree", "folder tree"
// to match PascalCase keys used in iconRegistry (e.g., "Warehouse", "FolderTree").
export function toPascalCase(s = "") {
  const clean = String(s).trim().replace(/[^a-zA-Z0-9]+/g, " ");
  if (!clean) return "";
  return clean
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

// Resolve an icon key to a React component from the registry, with graceful fallbacks.
export function getIconByKey(key, registry) {
  if (!key) return null;

  // Try exact key
  if (registry[key]) return registry[key];

  // Try PascalCase key
  const pascal = toPascalCase(key);
  if (registry[pascal]) return registry[pascal];

  // Try lowercase match against registry keys (case-insensitive)
  const lower = String(key).toLowerCase();
  const found = Object.entries(registry).find(([k]) => k.toLowerCase() === lower);
  if (found) return found[1];

  // Not found
  if (import.meta?.env?.MODE !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[sidebar] Unknown icon key: "${key}". Add it to iconRegistry.js or ensure generator emits a known key.`);
  }
  return null;
}
