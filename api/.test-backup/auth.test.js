import { describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import prisma from '../src/lib/prisma.js';

describe('Auth', () => {
  it('logs in with valid user', async () => {
    // Create test user
    const email = 'testuser@example.com';
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
       data: {
        name: 'Test User',
        email,
        passwordHash,
      },
    });

    // Test login
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects invalid login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrong' });
    
    expect(res.status).toBe(401);
  });
});
