import { describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import prisma from '../src/lib/prisma.js';

async function getAuthHeader() {
  const email = 'guard@example.com';
  const password = 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'Guard User', email, passwordHash },
  });

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email, password });
    
  return { Authorization: `Bearer ${loginRes.body.token}` };
}

describe('Auth guard', () => {
  it('401 on protected resource when logged out', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(401);
  });

  it('200 on protected resource when logged in', async () => {
    const auth = await getAuthHeader();
    const res = await request(app)
      .get('/api/assets')
      .set(auth);
    
    expect(res.status).toBe(200);
  });
});
