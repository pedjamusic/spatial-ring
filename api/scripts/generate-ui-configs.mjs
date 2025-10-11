import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');

const ALLOW = new Set([
  'Warehouse',
  'Asset',
  'AssetCategory',
  'Event',
  'EventLocation',
  'Movement',
]);

// Manual overrides for relations and special fields
const MANUAL_CONFIGS = {
  Event: {
    location: { label: 'Location', path: 'location.name' },
    notes: { widget: 'textarea', hideInTable: true },
  },
  Asset: {
    category: { label: 'Category', path: 'category.name' },
    warehouse: { label: 'Warehouse', path: 'warehouse.name' },
    notes: { widget: 'textarea', hideInTable: true },
  },
  Movement: {
    asset: { label: 'Asset', path: 'asset.name' },
    fromWarehouse: { label: 'From', path: 'fromWarehouse.name' },
    toWarehouse: { label: 'To', path: 'toWarehouse.name' },
    notes: { widget: 'textarea', hideInTable: true },
  },
};

const DEFAULT_HIDDEN = ['id', 'createdAt'];

const outDir = path.resolve(__dirname, '../../web/public/meta');
const outFile = path.join(outDir, 'ui-configs.json');

const generateConfig = (model) => {
  const config = {};
  
  DEFAULT_HIDDEN.forEach((fieldName) => {
    if (model.fields.some((f) => f.name === fieldName)) {
      config[fieldName] = { hidden: true };
    }
  });
  
  const manualConfig = MANUAL_CONFIGS[model.name] || {};
  Object.entries(manualConfig).forEach(([fieldName, fieldConfig]) => {
    config[fieldName] = { ...config[fieldName], ...fieldConfig };
  });
  
  return config;
};

const main = async () => {
  console.log('📂 Reading schema from:', schemaPath);
  
  const schemaContent = await fs.readFile(schemaPath, 'utf8');
  const prismaInternals = await import('@prisma/internals');
  const getDMMF = prismaInternals.getDMMF || prismaInternals.default?.getDMMF;
  
  if (!getDMMF) {
    throw new Error('Could not find getDMMF in @prisma/internals');
  }
  
  const dmmf = await getDMMF({ datamodel: schemaContent });
  const models = dmmf.datamodel.models.filter((m) => ALLOW.has(m.name));
  
  console.log(`📋 Found ${models.length} models:`, models.map(m => m.name));
  
  const uiConfigs = {};
  models.forEach((model) => {
    uiConfigs[model.name] = generateConfig(model);
  });
  
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(uiConfigs, null, 2), 'utf8');
  
  console.log(`✅ Wrote UI configs to ${outFile}`);
  console.log(JSON.stringify(uiConfigs, null, 2));
};

main().catch((e) => {
  console.error('❌ Failed to generate UI configs:', e);
  process.exit(1);
});
