import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname,'../prisma/schema.prisma');

// Adjust to your admin allowlist
const ALLOW = new Set([
  'Warehouse',
  'Asset',
  'AssetCategory',
  'Event',
  'EventLocation',
  'Movement',
]);

// Optional overrides for titles/paths that don’t pluralize cleanly
const OVERRIDES = {
  AssetCategory: { title: 'Asset Categories', path: 'assetCategories' },
  EventLocation: { title: 'Event Locations', path: 'eventLocations' },
};

const toTitle = (name) => {
  if (OVERRIDES[name]?.title) return OVERRIDES[name].title;
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
};

const toPath = (name) => {
  if (OVERRIDES[name]?.path) return OVERRIDES[name].path;
  const base = name.charAt(0).toLowerCase() + name.slice(1);
  return base.endsWith('y') ? `${base.slice(0, -1)}ies` : `${base}s`;
};

const toResource = (model, idx) => ({
  title: toTitle(model.name),
  modelName: model.name,
  resourceName: toPath(model.name),   // used by your REST client: /api/<resourceName>
  path: toPath(model.name),           // used by React Router: /admin/<path>
  order: (idx + 1) * 10,
  enabled: true,
});

const outDir = path.resolve(__dirname, '../../web/public/meta');
const outFile = path.join(outDir, 'resources.json');

const main = async () => {
  console.log('📂 Reading schema from:', schemaPath);

// Read schema file content
  const schemaContent = await fs.readFile(schemaPath, 'utf8');
  
  // Dynamic import for @prisma/internals (CommonJS module)
  const prismaInternals = await import('@prisma/internals');
  const getDMMF = prismaInternals.getDMMF || prismaInternals.default?.getDMMF;

  if (!getDMMF) {
    throw new Error('Could not find getDMMF function in @prisma/internals');
  }

  // Pass schema content as 'datamodel' parameter (newer API)
  const dmmf = await getDMMF({
    datamodel: schemaContent,
  });

  const models = dmmf.datamodel.models.filter((m) => ALLOW.has(m.name));

  console.log(`📋 Found ${models.length} allowed models:`, models.map(m => m.name));

  const resources = models.map(toResource).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(resources, null, 2), 'utf8');

  console.log(`✅ Wrote ${resources.length} resources to ${outFile}`);
  console.log(JSON.stringify(resources, null, 2));};

main().catch((e) => {
  console.error('❌ Failed to generate resources:', e);
  process.exit(1);
});
