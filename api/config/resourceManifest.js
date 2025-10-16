/**
 * Central configuration for all admin resources.
 * Each key is a Prisma model name; each value defines:
 *   - enabled: whether to generate routes for this model (default: true)
 *   - icon: the icon key to use (resolved at runtime via iconRegistry)
 *   - title: optional override for display name
 *   - path: optional override for the route segment
 *   - order: optional sort order (defaults to definition order)
 */

export const resourceManifest = {
  Warehouse: {
    enabled: true,
    icon: 'Warehouse',
    order: 10,
  },
  
  Asset: {
    enabled: true,
    icon: 'Package',
    order: 20,
  },
  
  AssetCategory: {
    enabled: true,
    icon: 'FolderTree',
    title: 'Asset Categories',
    path: 'assetCategories',
    order: 30,
  },
  
  Event: {
    enabled: true,
    icon: 'Calendar',
    order: 40,
  },
  
  EventLocation: {
    enabled: true,
    icon: 'MapPin',
    title: 'Event Locations',
    path: 'eventLocations',
    order: 50,
  },
  
  Movement: {
    enabled: true,
    icon: 'ArrowRightLeft',
    order: 60,
  },
};

// Helpers to extract derived data
export function getEnabledModels() {
  return Object.entries(resourceManifest)
    .filter(([, cfg]) => cfg.enabled !== false)
    .map(([name]) => name);
}

export function getModelConfig(modelName) {
  return resourceManifest[modelName] || {};
}
