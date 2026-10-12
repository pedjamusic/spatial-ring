import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const generatorPath = join(dirname(fileURLToPath(import.meta.url)), 'inject-env.mjs');

function generateConfig(t, env) {
  const outputDirectory = mkdtempSync(join(tmpdir(), 'inventory-runtime-config-'));
  t.after(() => rmSync(outputDirectory, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [generatorPath, outputDirectory], {
    env,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const source = readFileSync(join(outputDirectory, 'env-config.js'), 'utf8');
  const context = { window: {} };
  runInNewContext(source, context);
  return { config: context.window.env, source };
}

test('missing API base URL defaults to an empty string', (t) => {
  const { config } = generateConfig(t, {});
  assert.equal(config.VITE_API_BASE_URL, '');
  assert.deepEqual(Object.keys(config), ['VITE_API_BASE_URL']);
});

test('API base URL roundtrips quotes, backslashes, newlines, and script-like content', (t) => {
  const value = 'https://example.test/"quoted"\\path\nnext\rline\u2028separator\u2029end; window.injected = true; //';
  const { config } = generateConfig(t, { VITE_API_BASE_URL: value });
  assert.equal(config.VITE_API_BASE_URL, value);
  assert.deepEqual(Object.keys(config), ['VITE_API_BASE_URL']);
});

test('private and nonallowlisted VITE variables are excluded', (t) => {
  const privateValue = 'private-database-credential';
  const otherViteValue = 'unapproved-browser-setting';
  const { config, source } = generateConfig(t, {
    VITE_API_BASE_URL: '/api',
    DATABASE_URL: privateValue,
    VITE_SECRET: otherViteValue,
  });
  assert.equal(config.VITE_API_BASE_URL, '/api');
  assert.deepEqual(Object.keys(config), ['VITE_API_BASE_URL']);
  assert.equal(source.includes(privateValue), false);
  assert.equal(source.includes(otherViteValue), false);
});

test('a missing output directory fails the generator', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'inventory-runtime-config-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [generatorPath, join(directory, 'missing')], {
    env: {},
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ENOENT/);
});
