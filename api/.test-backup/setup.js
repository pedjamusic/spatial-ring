import { execSync } from 'node:child_process';
import { beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma.js';

// Test utilities
export async function setupTestDb() {
  try {
    console.log('🔧 Setting up test database...');
    execSync('npx prisma db push --force-reset', {
      stdio: 'pipe', // Don't show output unless there's an error
      env: { ...process.env, NODE_ENV: 'test' },
      shell: true,
    });
    console.log('✅ Test database ready');
  } catch (error) {
    console.log('ℹ️ Database already exists, continuing...');
  }
}

export async function teardownTestDb() {
  try {
    console.log('🧹 Cleaning up test data...');
    // Clean all test data but keep schema
    const tableNames = ['Movement', 'Asset', 'Event', 'EventLocation', 'Warehouse', 'AssetCategory', 'User'];
    for (const table of tableNames) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      } catch (e) {
        // Table might not exist, that's OK
      }
    }
    console.log('✅ Test cleanup complete');
  } catch (error) {
    console.error('⚠️ Cleanup error (non-fatal):', error.message);
  }
}

export async function seedTestUser() {
  const email = 'test@inventory.app';
  const password = 'Test123!';
  const passwordHash = await bcrypt.hash(password, 8);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { 
      name: 'Test User', 
      email, 
      passwordHash 
    },
  });
  
  return { user, email, password };
}

// Global setup/teardown
beforeAll(async () => {
  await setupTestDb();
  await seedTestUser();
}, 30000); // 30 second timeout

afterAll(async () => {
  // Clean up any existing test data
  try {
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } });
    await prisma.eventLocation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.asset.deleteMany();
  } catch (e) {
    // Ignore errors if tables don't exist yet
  }
  await teardownTestDb();
  await prisma.$disconnect();
});
