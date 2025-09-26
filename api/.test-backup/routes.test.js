import request from 'supertest';
import { app } from '../src/app.js';

test('meta lists models', async () => {
  const r = await request(app).get('/api/meta/models');
  expect(r.status).toBe(200);
  expect(Array.isArray(r.body)).toBe(true);
  expect(r.body.find(m => m.name === 'Asset')).toBeTruthy();
});
