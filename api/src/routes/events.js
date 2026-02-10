import express from 'express';
import prisma from '../lib/prisma.js';
import { paginateQuery, paginateResponse } from '../lib/pagination.js';

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { skip, take, page, limit, search } = paginateQuery(req);
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take,
        include: { location: { select: { name: true } } },
        orderBy: { startsAt: 'asc' }
      }),
      prisma.event.count({ where }),
    ]);
    res.json(paginateResponse(data, total, { page, limit }))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { location: { select: { name: true } } }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { name, locationId, startsAt, endsAt, notes } = req.body
    const event = await prisma.event.create({
      data: { name, locationId, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null, notes }
    })
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event' })
  }
})

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, locationId, startsAt, endsAt, notes } = req.body
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { name, locationId, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null, notes }
    })
    res.json(event)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update event' })
  }
})

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete event' })
  }
})

export default router;
