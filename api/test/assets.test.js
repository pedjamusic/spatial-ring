import { describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import prisma from '../src/lib/prisma.js';

async function getAuth() {
  const email = 'assets@test.com';
  const password = 'Test123!';
  const passwordHash = await bcrypt.hash(password, 8);
  
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'Test User', email, passwordHash },
  });

  const res = await request(app).post('/auth/login').send({ email, password });
  return { Authorization: `Bearer ${res.body.token}` };
}

describe('Assets CRUD', () => {
  it('GET /api/assets works', async () => {
    const auth = await getAuth();
    const res = await request(app).get('/api/assets').set(auth);
    expect(res.status).toBe(200);
  });

  it('POST /api/assets works', async () => {
    const auth = await getAuth();
    const res = await request(app)
      .post('/api/assets')
      .set(auth)
      .send({ name: 'Test Asset' });
    expect(res.status).toBe(201);
  });

  it('GET /api/assets includes availability fields', async () => {
    const auth = await getAuth();
    const created = await request(app)
      .post('/api/assets')
      .set(auth)
      .send({ name: 'Availability Asset', quantity: 3 });

    expect(created.status).toBe(201);

    const res = await request(app)
      .get('/api/assets?search=Availability Asset')
      .set(auth);

    expect(res.status).toBe(200);
    const asset = (res.body.data || []).find((row) => row.id === created.body.id);
    expect(asset).toBeDefined();
    expect(asset).toHaveProperty('totalQuantity', 3);
    expect(asset).toHaveProperty('availableQuantity', 3);
  });
});
