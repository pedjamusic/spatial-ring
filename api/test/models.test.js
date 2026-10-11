import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request   from 'supertest';
import { app }   from '../src/app.js';
import { login } from './_helpers.js';
import prisma from '../src/lib/prisma.js';

let auth;
const fixtures = {};
const created = [];

beforeAll(async () => {
  auth = await login();
  const suffix = Date.now();
  const warehouse = await prisma.warehouse.create({
    data: { name: `Test_Models Warehouse ${suffix}` },
  });
  fixtures.warehouses = warehouse.id;
  const location = await prisma.eventLocation.create({
    data: { name: `Test_Models Location ${suffix}` },
  });
  fixtures.eventLocations = location.id;
});

afterAll(async () => {
  // Clean only this file's rows, including records left by failed assertions.
  for (const { model, id } of created.toReversed()) {
    await prisma[model].deleteMany({ where: { id } });
  }
  if (fixtures.eventLocations) {
    await prisma.eventLocation.deleteMany({ where: { id: fixtures.eventLocations } });
  }
  if (fixtures.warehouses) {
    await prisma.warehouse.deleteMany({ where: { id: fixtures.warehouses } });
  }
});

const MODELS = [
  { name: 'warehouses',      model: 'warehouse',     create: () => ({ name: 'WH-A'       }) },
  { name: 'assetCategories', model: 'assetCategory', create: () => ({ name: 'Guitars'    }) },
  { name: 'eventLocations',  model: 'eventLocation', create: () => ({ name: 'Main Stage' }) },
  { name: 'events',          model: 'event',         create: (ids) => ({ name: 'Gig', locationId: ids.eventLocations }) },
  { name: 'assets',          model: 'asset',         create: (ids) => ({ name: 'Fender', restingLocationId: ids.warehouses }) },
  // add new models here ⬆
];

describe('CRUD / auth for every model', () => {
  MODELS.forEach(({ name, model, create }) => {
    const base = `/api/${name}`;

    it(`${name}: GET 401 when logged-out`, async () => {
      const r = await request(app).get(base);
      expect(r.status).toBe(401);
    });

    it(`${name}: full CRUD when logged-in`, async () => {
      // CREATE
      const body = create(fixtures);
      const r1 = await request(app).post(base).set(auth).send(body);
      if (r1.body.id) created.push({ model, id: r1.body.id });
      expect(r1.status).toBe(201);
      const id = r1.body.id;

      // GET (list)
      const r2 = await request(app).get(base).set(auth);
      expect(r2.status).toBe(200);

      // UPDATE
      const patch = Object.keys(body)[0];  // first field
      const r3 = await request(app)
        .put(`${base}/${id}`)
        .set(auth)
        .send({ [patch]: `${body[patch]}-updated` });

      expect(r3.status).toBe(200);

      // DELETE
      const r4 = await request(app).delete(`${base}/${id}`).set(auth);
      expect(r4.status).toBe(204);
    });
  });
});
