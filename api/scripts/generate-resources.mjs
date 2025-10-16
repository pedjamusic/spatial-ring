import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resourceManifest, getEnabledModels } from '../config/resourceManifest.js';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname,'../prisma/schema.prisma');

const outDir = path.resolve(__dirname, '../../web/public/meta');
const outFile = path.join(outDir, 'resources.json');

// Allowed models (from resourceManifest)
// const toTitle = (name) => {
//   if (OVERRIDES[name]?.title) return OVERRIDES[name].title;
//   return name.replace(/([a-z])([A-Z])/g, '$1 $2');
// };
const toTitle = (name, override) =>
  override || name.replace(/([a-z])([A-Z])/g, '$1 $2');


// const toPath = (name) => {
//   if (OVERRIDES[name]?.path) return OVERRIDES[name].path;
//   const base = name.charAt(0).toLowerCase() + name.slice(1);
//   return base.endsWith('y') ? `${base.slice(0, -1)}ies` : `${base}s`;
// };
// Helper: pluralize model name for path
const toPath = (name, override) => {
  if (override) return override;
  const base = name.charAt(0).toLowerCase() + name.slice(1);
  return base.endsWith('y') ? `${base.slice(0, -1)}ies` : `${base}s`;
};

// const toResource = (model, idx) => ({
//   title: toTitle(model.name),
//   modelName: model.name,
//   resourceName: toPath(model.name),   // used by your REST client: /api/<resourceName>
//   path: toPath(model.name),           // used by React Router: /admin/<path>
//   order: (idx + 1) * 10,
//   enabled: true,
// });
const toResource = (model, cfg) => ({
  title: toTitle(model.name, cfg.title),
  modelName: model.name,
  resourceName: toPath(model.name, cfg.path),
  path: toPath(model.name, cfg.path),
  order: cfg.order ?? 999,
  enabled: cfg.enabled !== false,
  icon: cfg.icon || null,
});



const main = async () => {
  console.log('📂 Reading schema from:', schemaPath);
// Read schema file content
  const schemaContent = await fs.readFile(schemaPath, 'utf8');
  const prismaInternals = await import('@prisma/internals'); // Dynamic import for @prisma/internals (CommonJS module)
  const getDMMF = prismaInternals.getDMMF || prismaInternals.default?.getDMMF;
  if (!getDMMF) {
    throw new Error('Could not find getDMMF function in @prisma/internals');
  }

  // Pass schema content as 'datamodel' parameter (newer API)
  const dmmf = await getDMMF({
    datamodel: schemaContent,
  });
  // const models = dmmf.datamodel.models.filter((m) => ALLOW.has(m.name));
  const enabledModelNames = new Set(getEnabledModels());
  const models = dmmf.datamodel.models.filter((m) => enabledModelNames.has(m.name));
  console.log(`📋 Found ${models.length} allowed models:`, models.map(m => m.name));

  // const resources = models.map(toResource).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); <-- OLD, new below

  // Load previous resources to preserve custom icons across runs (NEW)
  let previousIconsByModel = {};
  try {
    const prev = JSON.parse(await fs.readFile(outFile, 'utf8'));
    previousIconsByModel = Object.fromEntries(
      (prev || []).map((r) => [r.modelName, r.icon]).filter(([, v]) => !!v)
    );
  } catch { /* first run or missing file */ }

  // Build resources with merged icon precedence: previous > manifest > null
  const resources = models
    .map((model) => {
      const cfg = resourceManifest[model.name] || {};
      const base = toResource(model, cfg);
      const icon = previousIconsByModel[model.name] ?? cfg.icon ?? null;
      return { ...base, icon };
    })
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(resources, null, 2), 'utf8');

  console.log(`✅ Wrote ${resources.length} resources to ${outFile}`);
  console.log(JSON.stringify(resources, null, 2));};

main().catch((e) => {
  console.error('❌ Failed to generate resources:', e);
  process.exit(1);
});
