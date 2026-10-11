// One single, shared instance of the Prisma Client
import 'dotenv/config';
import { PrismaClient } from '../../generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';

export function createPrismaClient(connectionString) {
  if (!connectionString) throw new Error('DATABASE_URL environment variable is required');

  if (/^prisma(?:\+postgres)?:\/\//.test(connectionString)) {
    return new PrismaClient({ accelerateUrl: connectionString }).$extends(withAccelerate());
  }
  if (!/^postgres(?:ql)?:\/\//.test(connectionString)) {
    throw new Error('DATABASE_URL must use PostgreSQL or Prisma Accelerate');
  }
  const adapter = new PrismaPg({ connectionString, connectionTimeoutMillis: 5000 });
  return new PrismaClient({ adapter });
}

// This prevents multiple instances of Prisma Client in development due to hot-reloading.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || createPrismaClient(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
