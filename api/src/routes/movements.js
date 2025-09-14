import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// MOVEMENTS routes
// Note: The base path for this router is /movements,
// so a GET on '/' here corresponds to GET /api/movements

// GET /api/movements
router.get('/', async (req, res) => {
  try {
    const movements = await prisma.movement.findMany({
      include: { asset: true, event: true, performedBy: { select: { id: true, name: true } } },
      orderBy: { performedAt: 'desc' },
      take: 50
    })
    res.json(movements)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movements' })
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