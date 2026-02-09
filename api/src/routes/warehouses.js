import express from 'express';
import prisma from '../lib/prisma.js';
import { paginateQuery, paginateResponse } from '../lib/pagination.js';

const router = express.Router();

// GET /api/warehouses
router.get('/', async (req, res) => {
  try {
    const { skip, take, page, limit, search } = paginateQuery(req);
    const where = search
      ? { OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { kind: { contains: search, mode: 'insensitive' } },
        ] }
      : {};

    const [data, total] = await Promise.all([
      prisma.warehouse.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      prisma.warehouse.count({ where }),
    ]);
    res.json(paginateResponse(data, total, { page, limit }))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses' })
  }
})

// GET /api/warehouses/:id
router.get('/:id', async (req, res) => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: req.params.id }
    });
    if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });
    res.json(warehouse)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouse' })
  }
})

// POST /api/warehouses
router.post('/', async (req, res) => {
  try {
    const { name, kind } = req.body
    const warehouse = await prisma.warehouse.create({
      data: { name, kind }
    })
    res.status(201).json(warehouse)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create warehouse' })
  }
})

// PUT /api/warehouses/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, kind } = req.body
    const warehouse = await prisma.warehouse.update({
      where: { id: req.params.id },
      data: { name, kind }
    })
    res.json(warehouse)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update warehouse' })
  }
})

// DELETE /api/warehouses/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.warehouse.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete warehouse' })
  }
})

export default router;
