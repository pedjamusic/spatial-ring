import { randomUUID } from 'node:crypto';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import { login } from './_helpers.js';

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const RAW_NOTES = '  First line: "Fragile"\nSecond line: Joe\'s equipment  ';
const INVALID_NOTES = [
  { label: 'number', value: 1 },
  { label: 'boolean', value: false },
  { label: 'object', value: { text: 'Invalid notes' } },
  { label: 'array', value: ['Invalid notes'] },
];

describe('Warehouse notes', () => {
  let auth;
  let ownedNames;

  beforeAll(async () => {
    auth = await login();
  });

  beforeEach(() => {
    ownedNames = [];
  });

  afterEach(async () => {
    await prisma.warehouse.deleteMany({ where: { name: { in: ownedNames } } });
  });

  function ownWarehouseName() {
    const name = `Warehouse notes test ${randomUUID()}`;
    // Track before requests so unexpected successful writes are cleaned up too.
    ownedNames.push(name);
    return name;
  }

  async function createFixture() {
    return prisma.warehouse.create({
      data: { name: ownWarehouseName(), kind: 'indoor', notes: RAW_NOTES },
    });
  }

  async function readWarehouse(id) {
    const response = await request(app).get(`/api/warehouses/${id}`).set(auth);
    expect(response.status).toBe(HTTP_OK);
    return response.body;
  }

  it('creates notes and returns the exact text on a subsequent GET', async () => {
    const response = await request(app)
      .post('/api/warehouses')
      .set(auth)
      .send({ name: ownWarehouseName(), kind: 'indoor', notes: RAW_NOTES });

    expect(response.status).toBe(HTTP_CREATED);
    expect(response.body.notes).toBe(RAW_NOTES);
    expect((await readWarehouse(response.body.id)).notes).toBe(RAW_NOTES);
  });

  it('updates notes and returns the exact text on a subsequent GET', async () => {
    const warehouse = await createFixture();
    const notes = '  Updated "instructions"\nKeep Joe\'s boxes dry  ';
    const response = await request(app)
      .put(`/api/warehouses/${warehouse.id}`)
      .set(auth)
      .send({ name: warehouse.name, kind: warehouse.kind, notes });

    expect(response.status).toBe(HTTP_OK);
    expect(response.body.notes).toBe(notes);
    expect((await readWarehouse(warehouse.id)).notes).toBe(notes);
  });

  it('preserves existing notes when PUT omits notes', async () => {
    const warehouse = await createFixture();
    const response = await request(app)
      .put(`/api/warehouses/${warehouse.id}`)
      .set(auth)
      .send({ name: warehouse.name, kind: 'outdoor' });

    expect(response.status).toBe(HTTP_OK);
    expect(response.body.notes).toBe(RAW_NOTES);
    expect(await readWarehouse(warehouse.id)).toMatchObject({
      notes: RAW_NOTES,
      kind: 'outdoor',
    });
  });

  it('stores null when creation omits notes', async () => {
    const response = await request(app)
      .post('/api/warehouses')
      .set(auth)
      .send({ name: ownWarehouseName(), kind: 'indoor' });

    expect(response.status).toBe(HTTP_CREATED);
    expect(response.body.notes).toBeNull();
    expect((await readWarehouse(response.body.id)).notes).toBeNull();
  });

  for (const { label, value } of [
    { label: 'empty string', value: '' },
    { label: 'null', value: null },
  ]) {
    it(`accepts ${label} notes on creation`, async () => {
      const response = await request(app)
        .post('/api/warehouses')
        .set(auth)
        .send({ name: ownWarehouseName(), kind: 'indoor', notes: value });

      expect(response.status).toBe(HTTP_CREATED);
      expect(response.body.notes).toBe(value);
      expect((await readWarehouse(response.body.id)).notes).toBe(value);
    });

    it(`clears existing notes with ${label} on update`, async () => {
      const warehouse = await createFixture();
      const response = await request(app)
        .put(`/api/warehouses/${warehouse.id}`)
        .set(auth)
        .send({ name: warehouse.name, kind: warehouse.kind, notes: value });

      expect(response.status).toBe(HTTP_OK);
      expect(response.body.notes).toBe(value);
      expect((await readWarehouse(warehouse.id)).notes).toBe(value);
    });
  }

  for (const { label, value } of INVALID_NOTES) {
    it(`rejects ${label} notes on POST without creating a warehouse`, async () => {
      const name = ownWarehouseName();
      const response = await request(app)
        .post('/api/warehouses')
        .set(auth)
        .send({ name, kind: 'indoor', notes: value });

      expect(response.status).toBe(HTTP_BAD_REQUEST);
      expect(await prisma.warehouse.findUnique({ where: { name } })).toBeNull();
    });

    it(`rejects ${label} notes on PUT and leaves the warehouse unchanged`, async () => {
      const warehouse = await createFixture();
      const response = await request(app)
        .put(`/api/warehouses/${warehouse.id}`)
        .set(auth)
        .send({ name: warehouse.name, kind: 'outdoor', notes: value });

      expect(response.status).toBe(HTTP_BAD_REQUEST);
      expect(await readWarehouse(warehouse.id)).toMatchObject({
        name: warehouse.name,
        kind: warehouse.kind,
        notes: RAW_NOTES,
      });
    });
  }
});
