// One single, shared instance of the Prisma Client
import { PrismaClient } from '@prisma/client';

// This prevents multiple instances of Prisma Client in development due to hot-reloading.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
