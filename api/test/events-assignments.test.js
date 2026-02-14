import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import { login } from './_helpers.js';

let auth;
let warehouseId;
let eventId;
let assetAId;
let assetBId;

beforeAll(async () => {
  auth = await login();
  const suffix = Date.now();

  const warehouse = await prisma.warehouse.create({
    data: { name: `Test_Assignments Warehouse ${suffix}` },
  });
  warehouseId = warehouse.id;

  const event = await prisma.event.create({
    data: {
      name: `Test_Assignments Event ${suffix}`,
      startsAt: new Date('2026-03-01T10:00:00.000Z'),
      endsAt: new Date('2026-03-03T10:00:00.000Z'),
    },
  });
  eventId = event.id;

  const [assetA, assetB] = await Promise.all([
    prisma.asset.create({
      data: {
        name: 'Test_Assignments Camera A',
        quantity: 2,
        restingLocationId: warehouseId,
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Test_Assignments Camera B',
        quantity: 1,
        restingLocationId: warehouseId,
      },
    }),
  ]);

  assetAId = assetA.id;
  assetBId = assetB.id;
});

afterAll(async () => {
  await prisma.movement.deleteMany({ where: { eventId } });
  await prisma.asset.deleteMany({
    where: {
      id: { in: [assetAId, assetBId].filter(Boolean) },
    },
  });
  if (eventId) await prisma.event.delete({ where: { id: eventId } });
  if (warehouseId) await prisma.warehouse.delete({ where: { id: warehouseId } });
});

describe('Event asset assignments', () => {
  it('GET /api/events/:id/assignments returns active assignment list', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/assignments`)
      .set(auth);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('POST /api/events/:id/assignments assigns an asset and marks it InUse', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/assignments`)
      .set(auth)
      .send({ assetId: assetAId, quantity: 1, notes: 'Primary camera' });

    expect(res.status).toBe(201);
    expect(res.body.assetId).toBe(assetAId);
    expect(res.body.eventId).toBe(eventId);
    expect(res.body.type).toBe('InUse');

    const asset = await prisma.asset.findUnique({ where: { id: assetAId } });
    expect(asset?.status).toBe('InUse');
  });

  it('GET /api/events/:id/assignments includes newly assigned asset with quantities', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/assignments`)
      .set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].assetId).toBe(assetAId);
    expect(res.body.data[0].assignedQuantity).toBe(1);
    expect(res.body.data[0].availableQuantity).toBe(1);
    expect(res.body.data[0].totalQuantity).toBe(2);
  });

  it('GET /api/events/:id/assignable-assets includes partially available assets', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/assignable-assets`)
      .set(auth);

    expect(res.status).toBe(200);
    const assetA = res.body.data.find((asset) => asset.id === assetAId);
    const assetB = res.body.data.find((asset) => asset.id === assetBId);
    expect(assetA).toBeDefined();
    expect(assetA.availableQuantity).toBe(1);
    expect(assetA.totalQuantity).toBe(2);
    expect(assetB).toBeDefined();
    expect(assetB.availableQuantity).toBe(1);
  });

  it('POST /api/events/:id/assignments allows assigning remaining quantity', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/assignments`)
      .set(auth)
      .send({ assetId: assetAId, quantity: 1 });

    expect(res.status).toBe(201);
    expect(res.body.assetId).toBe(assetAId);
  });

  it('POST /api/events/:id/assignments rejects assigning above available quantity', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/assignments`)
      .set(auth)
      .send({ assetId: assetAId, quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Only 0 available');
  });
});
