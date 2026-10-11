import { describe, expect, it } from 'vitest';
import { createPrismaClient } from '../src/lib/prisma.js';

describe('Prisma connection selection', () => {
  it('rejects a missing URL before creating a connection', () => {
    expect(() => createPrismaClient('')).toThrow('DATABASE_URL environment variable is required');
  });

  it('rejects an unsupported URL without including its value in the error', () => {
    expect(() => createPrismaClient('file:private-database')).toThrow(
      /^DATABASE_URL must use PostgreSQL or Prisma Accelerate$/,
    );
  });

  it('reports a PostgreSQL connection failure through the driver adapter', async () => {
    const client = createPrismaClient('postgresql://smoke:smoke@127.0.0.1:1/smoke');
    try {
      await expect(client.user.count()).rejects.toMatchObject({ code: 'P1001' });
    } finally {
      await client.$disconnect();
    }
  });

  it.each(['prisma', 'prisma+postgres'])('constructs the %s Accelerate client without a TCP adapter', (scheme) => {
    const client = createPrismaClient(`${scheme}://accelerate.prisma-data.net/?api_key=smoke`);
    // Construction only: connecting (including Accelerate shutdown) requires a real key.
    expect(typeof client.user.findUnique).toBe('function');
  });
});
