import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_OUTPUT_DIRECTORY = '/usr/share/nginx/html';
const outputDirectory = process.argv[2] ?? DEFAULT_OUTPUT_DIRECTORY;

// Only this public setting belongs in the browser; other environment values may be secrets.
const config = { VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? '' };
writeFileSync(join(outputDirectory, 'env-config.js'), `window.env = ${JSON.stringify(config)};\n`, 'utf8');
