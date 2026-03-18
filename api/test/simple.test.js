import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Simple API Tests', () => {
  it('login endpoint exists', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'any@email.com', password: 'anything' });
    
    // We expect 401 (unauthorized), not 404 (not found)
    expect(res.status).toBe(401);
  });

  it('protected route requires auth', async () => {
    const res = await request(app).get('/api/assets');
    
    // Should return 401 without auth
    expect(res.status).toBe(401);
  });

  it('meta endpoint works', async () => {
    const res = await request(app).get('/api/meta/models');
    
    // Meta is public, should work
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
