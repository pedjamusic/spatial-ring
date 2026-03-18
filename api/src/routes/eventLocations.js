import express from 'express';
import prisma from '../lib/prisma.js';
import { paginateQuery, paginateResponse } from '../lib/pagination.js';

const router = express.Router();

// GET /api/eventLocations
router.get('/', async (req, res) => {
  try {
    const { skip, take, page, limit, search } = paginateQuery(req);
    const where = search
      ? { OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ] }
      : {};

    const [data, total] = await Promise.all([
      prisma.eventLocation.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      prisma.eventLocation.count({ where }),
    ]);
    res.json(paginateResponse(data, total, { page, limit }))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event locations' })
  }
})

// GET /api/eventLocations/:id
router.get('/:id', async (req, res) => {
  try {
    const eventLocation = await prisma.eventLocation.findUnique({
      where: { id: req.params.id }
    });
    if (!eventLocation) return res.status(404).json({ error: 'Event location not found' });
    res.json(eventLocation)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event location' })
  }
})

// POST /api/eventLocations
router.post('/', async (req, res) => {
  try {
    const { name, address, notes } = req.body
    const eventLocation = await prisma.eventLocation.create({
      data: { name, address, notes }
    })
    res.status(201).json(eventLocation)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event location' })
  }
})

// PUT /api/eventLocations/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, address, notes } = req.body

    const eventLocation = await prisma.eventLocation.update({
      where: { id: id },
      data: { name, address, notes }
    })
    res.json(eventLocation)
  } catch (error) {
    console.error('Failed to update event location:', error.message)
    res.status(400).json({ error: 'Failed to update event location' })
  }
})

// DELETE /api/eventLocations/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.eventLocation.delete({
      where: { id: id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete event location:', error.message)
    res.status(400).json({ error: 'Failed to delete event location' })
  }
})

export default router;
