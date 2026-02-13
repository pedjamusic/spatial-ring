import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const apiRoot = path.resolve(import.meta.dirname, '..');
const testEnvPath = path.join(apiRoot, '.env.test');
const devEnvPath = path.join(apiRoot, '.env');

function fail(message) {
  console.error(`\n[TEST ENV ERROR] ${message}\n`);
  process.exit(1);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const parsed = dotenv.parse(fs.readFileSync(filePath, 'utf8'));
  return parsed;
}

function looksLikeTestDatabase(databaseUrl) {
  try {
    const parsedUrl = new URL(databaseUrl);
    const dbName = parsedUrl.pathname.replace(/^\//, '').toLowerCase();
    const schema = (parsedUrl.searchParams.get('schema') || '').toLowerCase();
    const marker = `${dbName} ${schema}`;
    return /(^|[_-])test($|[_-])/.test(marker) || marker.includes('test');
  } catch {
    return /test/i.test(databaseUrl);
  }
}

const testEnv = loadEnvFile(testEnvPath);
if (!testEnv) {
  fail(`Missing api/.env.test. Create it from api/.env.test.example before running tests.`);
}

if (!testEnv.DATABASE_URL) {
  fail('api/.env.test must define DATABASE_URL.');
}

const devEnv = loadEnvFile(devEnvPath);
if (devEnv?.DATABASE_URL && devEnv.DATABASE_URL === testEnv.DATABASE_URL) {
  fail('api/.env.test DATABASE_URL matches api/.env DATABASE_URL. Tests must use an isolated database.');
}

if (!looksLikeTestDatabase(testEnv.DATABASE_URL)) {
  fail('api/.env.test DATABASE_URL does not look like a test database (expected a name/schema containing "test").');
}

console.log('[TEST ENV OK] Using isolated test database config from api/.env.test');
