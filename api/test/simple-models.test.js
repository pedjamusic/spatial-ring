import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { login, clearData } from './_helpers.js';

let auth;

beforeAll(async () => {
  auth = await login();
  await clearData();
});

afterAll(async () => {
  await clearData();
});

/*
 * Full CRUD smoke tests for the three "simple" models:
 *   Warehouse, AssetCategory, EventLocation
 *
 * Each suite: list → create → get by id → search → update → delete → confirm gone
 */

describe('Warehouse CRUD', () => {
  let id;

  it('GET /api/warehouses — empty list returns paginated envelope', async () => {
    const res = await request(app).get('/api/warehouses').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/warehouses — creates a warehouse', async () => {
    const res = await request(app)
      .post('/api/warehouses')
      .set(auth)
      .send({ name: 'Main Storage', kind: 'indoor' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Main Storage');
    expect(res.body.kind).toBe('indoor');
    expect(res.body.id).toBeDefined();
    id = res.body.id;
  });

  it('GET /api/warehouses/:id — returns the warehouse', async () => {
    const res = await request(app).get(`/api/warehouses/${id}`).set(auth);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe('Main Storage');
  });

  it('GET /api/warehouses?search= — finds by name', async () => {
    const res = await request(app).get('/api/warehouses?search=Main').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some((w) => w.id === id)).toBe(true);
  });

  it('GET /api/warehouses?search= — no results for gibberish', async () => {
    const res = await request(app).get('/api/warehouses?search=zzzznotfound').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('PUT /api/warehouses/:id — updates the warehouse', async () => {
    const res = await request(app)
      .put(`/api/warehouses/${id}`)
      .set(auth)
      .send({ name: 'Renamed Storage', kind: 'outdoor' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renamed Storage');
    expect(res.body.kind).toBe('outdoor');
  });

  it('DELETE /api/warehouses/:id — deletes the warehouse', async () => {
    const res = await request(app).delete(`/api/warehouses/${id}`).set(auth);
    expect(res.status).toBe(204);
  });

  it('GET /api/warehouses/:id — 404 after delete', async () => {
    const res = await request(app).get(`/api/warehouses/${id}`).set(auth);
    expect(res.status).toBe(404);
  });
});

describe('AssetCategory CRUD', () => {
  let id;

  it('GET /api/assetCategories — empty list returns paginated envelope', async () => {
    const res = await request(app).get('/api/assetCategories').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('POST /api/assetCategories — creates a category', async () => {
    const res = await request(app)
      .post('/api/assetCategories')
      .set(auth)
      .send({ name: 'Lighting' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Lighting');
    id = res.body.id;
  });

  it('GET /api/assetCategories/:id — returns the category', async () => {
    const res = await request(app).get(`/api/assetCategories/${id}`).set(auth);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe('Lighting');
  });

  it('GET /api/assetCategories?search= — finds by name', async () => {
    const res = await request(app).get('/api/assetCategories?search=Light').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('PUT /api/assetCategories/:id — updates the category', async () => {
    const res = await request(app)
      .put(`/api/assetCategories/${id}`)
      .set(auth)
      .send({ name: 'Stage Lighting' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Stage Lighting');
  });

  it('DELETE /api/assetCategories/:id — deletes the category', async () => {
    const res = await request(app).delete(`/api/assetCategories/${id}`).set(auth);
    expect(res.status).toBe(204);
  });

  it('GET /api/assetCategories/:id — 404 after delete', async () => {
    const res = await request(app).get(`/api/assetCategories/${id}`).set(auth);
    expect(res.status).toBe(404);
  });
});

describe('EventLocation CRUD', () => {
  let id;

  it('GET /api/eventLocations — empty list returns paginated envelope', async () => {
    const res = await request(app).get('/api/eventLocations').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('POST /api/eventLocations — creates a location', async () => {
    const res = await request(app)
      .post('/api/eventLocations')
      .set(auth)
      .send({ name: 'Convention Center', address: '123 Main St', notes: 'Big venue' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Convention Center');
    expect(res.body.address).toBe('123 Main St');
    id = res.body.id;
  });

  it('GET /api/eventLocations/:id — returns the location', async () => {
    const res = await request(app).get(`/api/eventLocations/${id}`).set(auth);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe('Convention Center');
  });

  it('GET /api/eventLocations?search= — finds by name', async () => {
    const res = await request(app).get('/api/eventLocations?search=Convention').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/eventLocations?search= — finds by address', async () => {
    const res = await request(app).get('/api/eventLocations?search=Main St').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('PUT /api/eventLocations/:id — updates the location', async () => {
    const res = await request(app)
      .put(`/api/eventLocations/${id}`)
      .set(auth)
      .send({ name: 'Updated Venue', address: '456 Oak Ave', notes: 'Renovated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Venue');
    expect(res.body.address).toBe('456 Oak Ave');
  });

  it('DELETE /api/eventLocations/:id — deletes the location', async () => {
    const res = await request(app).delete(`/api/eventLocations/${id}`).set(auth);
    expect(res.status).toBe(204);
  });

  it('GET /api/eventLocations/:id — 404 after delete', async () => {
    const res = await request(app).get(`/api/eventLocations/${id}`).set(auth);
    expect(res.status).toBe(404);
  });
});

describe('Pagination contract', () => {
  beforeAll(async () => {
    // Seed 3 warehouses for pagination tests
    for (let i = 1; i <= 3; i++) {
      await request(app)
        .post('/api/warehouses')
        .set(auth)
        .send({ name: `PagTest Warehouse ${i}` });
    }
  });

  it('respects ?limit= parameter', async () => {
    const res = await request(app).get('/api/warehouses?limit=2').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(2);
  });

  it('respects ?page= parameter', async () => {
    const p1 = await request(app).get('/api/warehouses?limit=2&page=1').set(auth);
    const p2 = await request(app).get('/api/warehouses?limit=2&page=2').set(auth);
    expect(p1.status).toBe(200);
    expect(p2.status).toBe(200);
    // Pages should have different items
    const ids1 = p1.body.data.map((w) => w.id);
    const ids2 = p2.body.data.map((w) => w.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap.length).toBe(0);
  });

  it('meta contains page, limit, total, totalPages', async () => {
    const res = await request(app).get('/api/warehouses?limit=2&page=1').set(auth);
    const { meta } = res.body;
    expect(meta).toHaveProperty('page', 1);
    expect(meta).toHaveProperty('limit', 2);
    expect(meta).toHaveProperty('total');
    expect(meta).toHaveProperty('totalPages');
    expect(meta.total).toBeGreaterThanOrEqual(3);
  });
});

describe('Auth guard', () => {
  const endpoints = [
    ['GET', '/api/warehouses'],
    ['GET', '/api/assetCategories'],
    ['GET', '/api/eventLocations'],
  ];

  endpoints.forEach(([method, url]) => {
    it(`${method} ${url} — 401 without token`, async () => {
      const res = await request(app)[method.toLowerCase()](url);
      expect(res.status).toBe(401);
    });
  });
});

describe('Meta endpoints', () => {
  it('GET /api/meta/models/:name — returns field metadata', async () => {
    const res = await request(app).get('/api/meta/models/Warehouse');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Warehouse');
    expect(res.body).toHaveProperty('fields');
    expect(Array.isArray(res.body.fields)).toBe(true);
    expect(res.body.fields.some((f) => f.name === 'name')).toBe(true);
  });
});
