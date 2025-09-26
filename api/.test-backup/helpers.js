import request from 'supertest';
import { app } from '../src/app.js';

export async function loginAndGetAuth() {
  const email = 'test@example.com';
  const password = 'Test123!';
  
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password });
    
  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  
  return { Authorization: `Bearer ${res.body.token}` };
}

export async function createTestWarehouse(auth, name = 'Test Warehouse') {
  const res = await request(app)
    .post('/api/warehouses')
    .set(auth)
    .send({ name });
    
  if (res.status !== 201) {
    throw new Error(`Warehouse creation failed: ${res.status}`);
  }
  
  return res.body;
}

export async function createTestEventLocation(auth, name = 'Test Location') {
  const res = await request(app)
    .post('/api/eventLocations')
    .set(auth)
    .send({ name });
    
  if (res.status !== 201) {
    throw new Error(`Event location creation failed: ${res.status}`);
  }
  
  return res.body;
}
