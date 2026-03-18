import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import prisma from '../src/lib/prisma.js';
import { app } from '../src/app.js';
import { login } from './_helpers.js';

let auth;
const createdEventIds = [];
const suffix = Date.now();

beforeAll(async () => {
  auth = await login();

  const [pastEvent, activeEvent] = await Promise.all([
    prisma.event.create({
      data: {
        name: `TestScope Past ${suffix}`,
        startsAt: new Date('2025-01-01T10:00:00.000Z'),
        endsAt: new Date('2025-01-02T10:00:00.000Z'),
      },
    }),
    prisma.event.create({
      data: {
        name: `TestScope Active ${suffix}`,
        startsAt: new Date('2030-01-01T10:00:00.000Z'),
        endsAt: new Date('2030-01-02T10:00:00.000Z'),
      },
    }),
  ]);

  createdEventIds.push(pastEvent.id, activeEvent.id);
});

afterAll(async () => {
  if (!createdEventIds.length) return;
  await prisma.event.deleteMany({ where: { id: { in: createdEventIds } } });
});

describe('Events scope filters', () => {
  it('GET /api/events?scope=active returns only active/upcoming events', async () => {
    const res = await request(app)
      .get(`/api/events?scope=active&search=TestScope&limit=100`)
      .set(auth);

    expect(res.status).toBe(200);
    const names = (res.body.data || []).map((e) => e.name);
    expect(names.some((name) => name.includes('Active'))).toBe(true);
    expect(names.some((name) => name.includes('Past'))).toBe(false);
  });

  it('GET /api/events?scope=archived returns only past events', async () => {
    const res = await request(app)
      .get(`/api/events?scope=archived&search=TestScope&limit=100`)
      .set(auth);

    expect(res.status).toBe(200);
    const names = (res.body.data || []).map((e) => e.name);
    expect(names.some((name) => name.includes('Past'))).toBe(true);
    expect(names.some((name) => name.includes('Active'))).toBe(false);
  });
});
