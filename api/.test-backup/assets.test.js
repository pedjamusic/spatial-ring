import request from 'supertest';
import { app } from '../src/app.js';
import { loginAndGetAuth } from './setup.js';

async function createWarehouse(auth, name='Main WH') {
  const r = await request(app).post('/api/warehouses').set(auth).send({ name });
  expect(r.status).toBe(201);
  return r.body;
}

describe('Assets CRUD', () => {
  let auth, wh;
  beforeAll(async () => {
    auth = await loginAndGetAuth();
    wh = await createWarehouse(auth);
  });

  test('create + update asset', async () => {
    const create = await request(app).post('/api/assets').set(auth).send({
      name: 'Camera A',
      restingLocationId: wh.id,
      quantity: 1
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const put = await request(app).put(`/api/assets/${id}`).set(auth).send({
      name: 'Camera A v2',
      restingLocationId: wh.id
    });
    expect(put.status).toBe(200);
    expect(put.body.name).toBe('Camera A v2');
  });
});
