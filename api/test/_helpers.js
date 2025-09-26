import request from 'supertest';
import bcrypt  from 'bcrypt';
import prisma  from '../src/lib/prisma.js';
import { app } from '../src/app.js';

export async function login() {
  const email = 'tester@example.com';
  const pass  = 'Pass123!';
  const hash  = await bcrypt.hash(pass, 10);

  await prisma.user.upsert({
    where:  { email },
    update: {},
    create: { name: 'Tester', email, passwordHash: hash },
  });

  const r = await request(app).post('/auth/login').send({ email, password: pass });
  if (r.status !== 200) throw new Error('Login failed');
  return { Authorization: `Bearer ${r.body.token}` };
}

export async function clearData() {
  // delete order matters when relations exist
  await prisma.$transaction([
    prisma.asset.deleteMany(),
    prisma.event.deleteMany(),
    prisma.eventLocation.deleteMany(),
    prisma.warehouse.deleteMany(),
    prisma.assetCategory.deleteMany(),
  ]);
}
