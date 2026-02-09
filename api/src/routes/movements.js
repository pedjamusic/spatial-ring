import express from 'express';
import prisma from '../lib/prisma.js';
import { paginateQuery, paginateResponse } from '../lib/pagination.js';

const router = express.Router();

// GET /api/movements
router.get('/', async (req, res) => {
  try {
    const { skip, take, page, limit, search } = paginateQuery(req);
    const where = search
      ? { notes: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      prisma.movement.findMany({
        where,
        skip,
        take,
        include: { asset: true, event: true, performedBy: { select: { id: true, name: true } } },
        orderBy: { performedAt: 'desc' },
      }),
      prisma.movement.count({ where }),
    ]);
    res.json(paginateResponse(data, total, { page, limit }))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movements' })
  }
})

// GET /api/movements/:id
router.get('/:id', async (req, res) => {
  try {
    const movement = await prisma.movement.findUnique({
      where: { id: req.params.id },
      include: { asset: true, event: true, performedBy: { select: { id: true, name: true } } }
    });
    if (!movement) return res.status(404).json({ error: 'Movement not found' });
    res.json(movement)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movement' })
  }
})

// POST /api/movements
router.post('/', async (req, res) => {
  try {
    const { assetId, type, quantity, locationId, eventId, performedById, notes } = req.body
    const movement = await prisma.movement.create({
      data: { assetId, type, quantity: parseInt(quantity), locationId, eventId, performedById, notes }
    })
    res.status(201).json(movement)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create movement' })
  }
})

export default router;
