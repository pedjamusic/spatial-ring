import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./test/global-setup.js'],
    include: ['test/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'src/**/node_modules', 'src/**/dist'],
    hookTimeout: 30000,
  },
});
