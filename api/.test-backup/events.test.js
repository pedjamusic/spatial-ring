import { describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import prisma from '../src/lib/prisma.js';

async function setupAuth() {
  const email = 'events@example.com';
  const password = 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'Events User', email, passwordHash },
  });

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email, password });
    
  return { Authorization: `Bearer ${loginRes.body.token}` };
}

describe('Events CRUD', () => {
  it('GET list (authorized)', async () => {
    const auth = await setupAuth();
    const res = await request(app)
      .get('/api/events')
      .set(auth);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST -> PUT -> DELETE lifecycle', async () => {
    const auth = await setupAuth();
    
    // Create event location first
    const locRes = await request(app)
      .post('/api/eventLocations')
      .set(auth)
      .send({ name: 'Test Location' });
    
    expect(locRes.status).toBe(201);
    const locationId = locRes.body.id;

    // Create event
    const createRes = await request(app)
      .post('/api/events')
      .set(auth)
      .send({
        name: 'Test Event',
        locationId,
        startsAt: new Date().toISOString(),
      });
    
    expect(createRes.status).toBe(201);
    const eventId = createRes.body.id;

    // Update event
    const updateRes = await request(app)
      .put(`/api/events/${eventId}`)
      .set(auth)
      .send({ name: 'Updated Event', locationId });
    
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe('Updated Event');

    // Delete event
    const deleteRes = await request(app)
      .delete(`/api/events/${eventId}`)
      .set(auth);
    
    expect(deleteRes.status).toBe(204);
  });
});
