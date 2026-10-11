import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { mkdtemp, realpath, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Resolve the dependency used by Prisma's config loader, including nested installs.
const require = createRequire(import.meta.url);
const prismaRequire = createRequire(require.resolve('@prisma/config'));
const { deepmerge } = prismaRequire('deepmerge-ts');
const { loadConfigFromFile } = require('@prisma/config');

describe('Prisma config merge dependency', () => {
  it('loads a real Prisma config with schema and migration settings', async () => {
    const directory = await realpath(await mkdtemp(path.join(tmpdir(), 'inventory-prisma-config-')));
    try {
      await writeFile(path.join(directory, 'prisma.config.mjs'),
        "export default { schema: 'schema.prisma', migrations: { path: 'migrations', seed: 'node seed.js' } };\n");
      const result = await loadConfigFromFile({ configRoot: directory });

      expect(result.error).toBeUndefined();
      expect(result.config.schema).toBe(path.join(directory, 'schema.prisma'));
      expect(result.config.migrations.path).toBe(path.join(directory, 'migrations'));
      expect(result.config.migrations.seed).toBe('node seed.js');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('merges ordinary config records without mutating the inputs', () => {
    const defaults = { migrations: { path: 'prisma/migrations' } };
    const settings = { migrations: { seed: 'node seed.js' }, schema: 'prisma/schema.prisma' };

    expect(deepmerge(defaults, settings)).toEqual({
      migrations: { path: 'prisma/migrations', seed: 'node seed.js' },
      schema: 'prisma/schema.prisma',
    });
    expect(defaults).toEqual({ migrations: { path: 'prisma/migrations' } });
    expect(settings).toEqual({ migrations: { seed: 'node seed.js' }, schema: 'prisma/schema.prisma' });
  });

  it('handles recursive records without exhausting the stack', () => {
    const left = { left: true };
    const right = { right: true };
    left.self = left;
    right.self = right;

    let merged;
    expect(() => { merged = deepmerge(left, right); }).not.toThrow();
    expect(merged.left).toBe(true);
    expect(merged.right).toBe(true);
  });
});
