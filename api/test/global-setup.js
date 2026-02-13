import { execSync } from 'node:child_process';
import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma.js';

export default async function globalSetup() {
  execSync('npx prisma db push --force-reset', {
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
    shell: true,
  });

  const email = 'tester@example.com';
  const pass = 'Pass123!';
  const hash = await bcrypt.hash(pass, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'Tester', email, passwordHash: hash },
  });

  await prisma.$disconnect();
}
